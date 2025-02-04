import logging
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from diffusers.pipelines.stable_diffusion.pipeline_stable_diffusion import StableDiffusionPipeline
import torch
from io import BytesIO
from fastapi.responses import StreamingResponse

# Initialize FastAPI app
ImageRouter = APIRouter(prefix="/image")

# Load the Stable Diffusion model
# Choose the appropriate device
if torch.backends.mps.is_available():
    device = "mps"  # For Apple Silicon
elif torch.cuda.is_available():
    device = "cuda"  # For NVIDIA GPU
else:
    device = "cpu"  # Fallback to CPU
model_id = "stabilityai/stable-diffusion-xl-base-1.0"
pipe = StableDiffusionPipeline.from_pretrained(model_id, torch_dtype=torch.float16)
pipe = pipe.to(device)

# Define a request model
class ImageRequest(BaseModel):
    prompt: str
    negative_prompt: str | None = None
    num_inference_steps: int = 50
    guidance_scale: float = 7.5

@ImageRouter.post("/generate")
async def generate_image(request: ImageRequest):
    """
    Generate an image based on the provided prompt and parameters.
    """
    try:
        # Generate the image
        generated_image = pipe(
            prompt=request.prompt,
            negative_prompt=request.negative_prompt,
            num_inference_steps=request.num_inference_steps,
            guidance_scale=request.guidance_scale,
        ).images[0] # type: ignore

        # Save the image to a byte stream
        img_byte_arr = BytesIO()
        generated_image.save(img_byte_arr, format="PNG")
        img_byte_arr.seek(0)

        # Return the image as a streaming response
        return StreamingResponse(img_byte_arr, media_type="image/png")
    except Exception as e:
        logging.error(f"Error generating image: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error generating image: {str(e)}")

# Run the app with `uvicorn main:app --reload`