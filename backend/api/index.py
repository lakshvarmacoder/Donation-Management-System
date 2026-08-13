import os
import sys

# Get absolute path of this file (backend/api/index.py)
file_dir = os.path.dirname(os.path.abspath(__file__))
# Get backend root directory (backend/)
backend_root = os.path.abspath(os.path.join(file_dir, ".."))

# Add backend root to sys.path so 'app' module can be imported
if backend_root not in sys.path:
    sys.path.insert(0, backend_root)

# Import the FastAPI instance from app.main
from app.main import app
