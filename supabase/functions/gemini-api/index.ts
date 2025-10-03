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
        prompt = `You are an expert at image editing and manipulation. Your task is to take this photo of a person and transform it into a professional full-body fashion model photograph while PRESERVING THEIR EXACT IDENTITY.

**CRITICAL REQUIREMENTS:**
1. **PRESERVE IDENTITY:** The person's face, facial features, skin tone, hair color, hair style, eye color, and ALL unique characteristics MUST remain EXACTLY the same. Do NOT change or idealize their appearance.
2. **Full Body Pose:** Create a full-body shot in a natural, relaxed standing pose suitable for fashion modeling (straight posture, arms at sides or one hand in pocket).
3. **Professional Setting:** Place them against a clean, neutral studio backdrop (light gray, #f0f0f0 or similar).
4. **Natural Expression:** Give them a neutral, calm, professional model expression.
5. **Realistic Quality:** The final image must be photorealistic with proper lighting, shadows, and proportions.
6. **Body Type:** Preserve their natural body type and proportions.

**OUTPUT:** Return ONLY the final edited photograph. No text, no variations, just the single image.`;
        parts = [
          { inline_data: { mime_type: body.userImage.split(';')[0].split(':')[1], data: body.userImage.split(',')[1] } },
          { text: prompt }
        ];
        break;

      case 'generateTryOn':
        if (!body.modelImage || !body.garmentImage) throw new Error('modelImage and garmentImage are required');
        prompt = `You are an expert at virtual try-on image editing. You will receive TWO images:
1. A MODEL IMAGE showing a person
2. A GARMENT IMAGE showing clothing

Your task is to create a photorealistic image of the person wearing the garment.

**CRITICAL REQUIREMENTS:**

**IDENTITY & APPEARANCE:**
- The person's face, hair, skin tone, body shape, and ALL physical features from the MODEL IMAGE must remain EXACTLY the same
- Do NOT alter or idealize their appearance in any way

**GARMENT APPLICATION:**
- COMPLETELY REMOVE all clothing from the MODEL IMAGE that conflicts with the new garment
- Place the EXACT garment from the GARMENT IMAGE onto the person
- Match the garment's color, pattern, texture, fabric type, and design PRECISELY
- If it's a shirt/top: remove only the upper body clothing, keep pants/lower body as is
- If it's pants/bottom: remove only the lower body clothing, keep shirt/upper body as is
- If it's a full outfit/dress: replace all clothing
- The garment should fit naturally with realistic folds, wrinkles, and shadows based on the person's pose

**POSE & BACKGROUND:**
- Keep the EXACT same pose and body position from the MODEL IMAGE
- Preserve the EXACT same background from the MODEL IMAGE
- Maintain the same lighting and shadows as the original scene

**REALISM:**
- The final result must look like a real photograph, not a composite
- Natural fabric draping and movement
- Consistent lighting across the entire image
- Proper shadows and highlights on the garment

**OUTPUT:** Return ONLY the final edited photograph. No text, no variations, just the single image.`;
        parts = [
          { inline_data: { mime_type: body.modelImage.split(';')[0].split(':')[1], data: body.modelImage.split(',')[1] } },
          { inline_data: { mime_type: body.garmentImage.split(';')[0].split(':')[1], data: body.garmentImage.split(',')[1] } },
          { text: prompt }
        ];
        break;

      case 'generatePose':
        if (!body.tryOnImage || !body.poseInstruction) throw new Error('tryOnImage and poseInstruction are required');
        prompt = `You are an expert fashion photographer and image editor. Take this fashion photograph and create a new version from a different angle or perspective.

**CRITICAL REQUIREMENTS:**
1. **PRESERVE IDENTITY:** The person's face, features, hair, skin tone, and appearance must remain EXACTLY the same
2. **PRESERVE CLOTHING:** The clothing, its color, pattern, style, and fit must remain EXACTLY the same
3. **PRESERVE BACKGROUND:** Keep the same style and color of background
4. **NEW PERSPECTIVE:** Change the viewing angle to: "${body.poseInstruction}"
5. **REALISM:** The result must look like a real photograph taken from a different angle

**OUTPUT:** Return ONLY the final photograph. No text, no variations, just the single image.`;
        parts = [
          { inline_data: { mime_type: body.tryOnImage.split(';')[0].split(':')[1], data: body.tryOnImage.split(',')[1] } },
          { text: prompt }
        ];
        break;

      default:
        throw new Error('Invalid action');
    }

    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts }],
          generationConfig: {
            response_modalities: ['image', 'text'],
            temperature: 0.4
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