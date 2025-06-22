#!/bin/bash

# Set variables
PROJECT_ID="eir-ops-project"  # Your GCP project ID
SERVICE_NAME="oz-cms2"  # Changed service name to match this repo
REGION="asia-northeast1"  # Your preferred region

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${GREEN}Quick deployment for $SERVICE_NAME${NC}"
echo "=========================================="

# Generate a tag for the image (commit hash or timestamp)
TAG=$(git rev-parse --short HEAD 2>/dev/null || date +%Y%m%d%H%M%S)
IMAGE_NAME="gcr.io/$PROJECT_ID/$SERVICE_NAME:$TAG"

echo -e "\n${BLUE}Step 1/3: Building Docker image${NC}"
echo "Image: $IMAGE_NAME"
docker build --platform=linux/amd64 -t $IMAGE_NAME .

if [ $? -ne 0 ]; then
    echo -e "${YELLOW}Docker build failed. Aborting deployment.${NC}"
    exit 1
fi

echo -e "\n${BLUE}Step 2/3: Pushing image to Google Container Registry${NC}"
docker push $IMAGE_NAME

if [ $? -ne 0 ]; then
    echo -e "${YELLOW}Failed to push Docker image. Aborting deployment.${NC}"
    exit 1
fi

echo -e "\n${BLUE}Step 2.5/3: Ensuring secret access permissions${NC}"
# Get the Cloud Run service account and grant access to secrets
SERVICE_ACCOUNT="$(gcloud projects describe $PROJECT_ID --format='value(projectNumber)')-compute@developer.gserviceaccount.com"

# Grant access to OpenRouter API key
gcloud secrets add-iam-policy-binding OPENROUTER_API_KEY \
    --member="serviceAccount:$SERVICE_ACCOUNT" \
    --role="roles/secretmanager.secretAccessor" \
    --quiet || echo "OPENROUTER_API_KEY permission already exists or failed to set"

# Check if GITHUB_TOKEN secret exists, if not prompt user to create it
if ! gcloud secrets describe GITHUB_TOKEN --quiet >/dev/null 2>&1; then
    echo -e "\n${YELLOW}⚠️  GITHUB_TOKEN secret not found!${NC}"
    echo -e "${YELLOW}You need to create it with your GitHub Personal Access Token:${NC}"
    echo -e "1. Generate a token at: ${BLUE}https://github.com/settings/tokens${NC}"
    echo -e "2. Select 'repo' scope for full repository access"
    echo -e "3. Run: ${BLUE}gcloud secrets create GITHUB_TOKEN --data-file=-${NC}"
    echo -e "4. Paste your token and press Ctrl+D"
    echo -e "\n${YELLOW}Without this, Git push operations will fail in production!${NC}"
    read -p "Press Enter to continue anyway, or Ctrl+C to abort and create the secret first..."
fi

# Grant access to GitHub token for live editing and Git operations
gcloud secrets add-iam-policy-binding GITHUB_TOKEN \
    --member="serviceAccount:$SERVICE_ACCOUNT" \
    --role="roles/secretmanager.secretAccessor" \
    --quiet || echo "GITHUB_TOKEN permission already exists or failed to set"

echo -e "\n${GREEN}Git authentication configured via GITHUB_TOKEN secret${NC}"
echo -e "${GREEN}Live editing with Git push functionality will be available${NC}"

echo -e "\n${BLUE}Step 3/3: Deploying to Cloud Run${NC}"
gcloud run deploy $SERVICE_NAME \
  --image $IMAGE_NAME \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --set-secrets OPENROUTER_API_KEY=OPENROUTER_API_KEY:latest,GITHUB_TOKEN=GITHUB_TOKEN:latest \
  --set-env-vars GIT_USER_NAME="Eir Live Editor" \
  --set-env-vars GIT_USER_EMAIL="live-editor@eir.inc"

if [ $? -eq 0 ]; then
    echo -e "\n${GREEN}Deployment complete!${NC}"
    SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --region $REGION --format="value(status.url)")
    echo -e "You can view your service at: ${BLUE}$SERVICE_URL${NC}"
    echo -e "\n${GREEN}✅ Live editing with Git commits now enabled!${NC}"
    echo -e "✅ OPENROUTER_API_KEY available for AI features"
    echo -e "✅ GITHUB_TOKEN available for automated Git operations"
else
    echo -e "\n${YELLOW}Deployment failed. Check the logs for more information.${NC}"
    exit 1
fi 