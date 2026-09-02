import os
import zipfile
import shutil

def make_zip():
    base_dir = r"c:\Users\hmudg\OneDrive\Desktop\Early Worningi system"
    zip_path = os.path.join(base_dir, "EWS-Landslide-Full-Codebase.zip")
    
    # Excluded folder and file patterns
    exclude_dirs = {
        "node_modules", "dist", ".git", ".gradle", "build", "target", 
        "__pycache__", "venv", ".idea", ".vscode", "temp_zip_staging"
    }
    exclude_extensions = {".pyc", ".class", ".log"}
    
    print(f"Creating ZIP archive at: {zip_path}")
    
    with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
        # Walk through all directories
        for root, dirs, files in os.walk(base_dir):
            # Prune excluded directories
            dirs[:] = [d for d in dirs if d not in exclude_dirs]
            
            for file in files:
                # Do not include the zip itself or scratch temp scripts
                if file.endswith(".zip") or file.endswith(".tmp"):
                    continue
                _, ext = os.path.splitext(file)
                if ext in exclude_extensions:
                    continue
                
                full_path = os.path.join(root, file)
                rel_path = os.path.relpath(full_path, base_dir)
                
                # Exclude scratch directory if desired or keep
                if rel_path.startswith("scratch"):
                    continue
                    
                zipf.write(full_path, rel_path)
                
    size_mb = os.path.getsize(zip_path) / (1024 * 1024)
    print(f"SUCCESS! Zip created. Size: {size_mb:.2f} MB")

if __name__ == "__main__":
    make_zip()
