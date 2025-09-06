# FlowMint Backend

FastAPI backend for the FlowMint application.

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Run the server:
```bash
python main.py
```

The API will be available at `http://localhost:8000`

## API Endpoints

- `GET /` - Health check
- `POST /api/register` - Register a user with wallet address and role
- `GET /api/user/{wallet_address}` - Get user information by wallet address

## Example Usage

Register a user:
```bash
curl -X POST "http://localhost:8000/api/register" \
  -H "Content-Type: application/json" \
  -d '{"walletAddress": "0x123...", "role": "creator"}'
```
