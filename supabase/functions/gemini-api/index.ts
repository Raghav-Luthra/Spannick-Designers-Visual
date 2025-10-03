import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.58.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface RequestBody {
  action: 'generateModel' | 'generateTryOn' | 'generatePose';
  userImage?: string;
  modelImage?: string;
  garmentImage?: string;
  tryOnImage?: string;
  poseInstruction?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: apiKeyData, error: apiKeyError } = await supabase
      .from('api_keys')
      .select('api_key')
      .eq('service_name', 'gemini')
      .maybeSingle();

    if (apiKeyError || !apiKeyData?.api_key) {
      throw new Error('Gemini API key not found in database');
    }

    const apiKey = apiKeyData.api_key;
    const body: RequestBody = await req.json();

    let prompt = '';
    let parts: any[] = [];

    switch (body.action) {
      case 'generateModel':
        if (!body.userImage) throw new Error('userImage is required');
        prompt = "Take this person and create a professional full-body fashion photograph of them. Keep their exact face, hair, body type, skin tone, and all unique features completely unchanged. Position them in a natural standing model pose against a clean light gray studio background. The lighting should be soft and professional, like a high-end fashion photoshoot. Make it look like a real photograph taken in a professional studio.";
        parts = [
          { inline_data: { mime_type: body.userImage.split(';')[0].split(':')[1], data: body.userImage.split(',')[1] } },
          { text: prompt }
        ];
        break;

      case 'generateTryOn':
        if (!body.modelImage || !body.garmentImage) throw new Error('modelImage and garmentImage are required');
        prompt = "Edit this person's photograph by replacing their current clothing with the garment shown in the second image. Keep the person's face, hair, pose, and background exactly as they are. Remove their current clothing completely and dress them in the new garment, matching its exact colors, patterns, and style. Make sure the garment fits naturally on their body with realistic fabric folds and shadows that match the original lighting. The result should look like they were originally photographed wearing this outfit.";
        parts = [
          { inline_data: { mime_type: body.modelImage.split(';')[0].split(':')[1], data: body.modelImage.split(',')[1] } },
          { inline_data: { mime_type: body.garmentImage.split(';')[0].split(':')[1], data: body.garmentImage.split(',')[1] } },
          { text: prompt }
        ];
        break;

      case 'generatePose':
        if (!body.tryOnImage || !body.poseInstruction) throw new Error('tryOnImage and poseInstruction are required');
        prompt = `Take this fashion photograph and recreate it from ${body.poseInstruction}. Keep the person, their clothing, and the background style exactly the same, just change the camera angle or perspective. Make it look like a real photograph taken from this new viewpoint.`;
        parts = [
          { inline_data: { mime_type: body.tryOnImage.split(';')[0].split(':')[1], data: body.tryOnImage.split(',')[1] } },
          { text: prompt }
        ];
        break;

      default:
        throw new Error('Invalid action');
    }

    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts }],
          generationConfig: {
            response_modalities: ['image']
          }
        })
      }
    );

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      throw new Error(`Gemini API error: ${errorText}`);
    }

    const geminiData = await geminiResponse.json();

    if (geminiData.promptFeedback?.blockReason) {
      const { blockReason, blockReasonMessage } = geminiData.promptFeedback;
      throw new Error(`Request was blocked. Reason: ${blockReason}. ${blockReasonMessage || ''}`);
    }

    for (const candidate of geminiData.candidates ?? []) {
      const imagePart = candidate.content?.parts?.find((part: any) => part.inlineData || part.inline_data);
      if (imagePart) {
        const inlineData = imagePart.inlineData || imagePart.inline_data;
        const { mimeType, mime_type, data } = inlineData;
        const finalMimeType = mimeType || mime_type;
        return new Response(
          JSON.stringify({ imageUrl: `data:${finalMimeType};base64,${data}` }),
          {
            headers: {
              ...corsHeaders,
              'Content-Type': 'application/json',
            },
          }
        );
      }
    }

    const finishReason = geminiData.candidates?.[0]?.finishReason;
    if (finishReason && finishReason !== 'STOP') {
      throw new Error(`Image generation stopped unexpectedly. Reason: ${finishReason}`);
    }

    throw new Error('The AI model did not return an image');

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});