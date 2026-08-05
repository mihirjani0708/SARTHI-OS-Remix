import os
import zipfile

zip_filename = "SARTHI-OS-Remix-Complete.zip"
exclude_dirs = {"node_modules", ".git", ".tmp", "dist", ".cache"}
exclude_files = {zip_filename, ".DS_Store"}

root_dir = "."

print(f"Creating {zip_filename}...")

file_count = 0
with zipfile.ZipFile(zip_filename, "w", zipfile.ZIP_DEFLATED) as zipf:
    for dirpath, dirnames, filenames in os.walk(root_dir):
        # Modify dirnames in-place to skip excluded directories
        dirnames[:] = [d for d in dirnames if d not in exclude_dirs]
        
        for filename in filenames:
            if filename in exclude_files:
                continue
            
            filepath = os.path.join(dirpath, filename)
            # Arcname relative to root_dir
            arcname = os.path.relpath(filepath, root_dir)
            
            # Avoid adding the zip file itself if created in root
            if arcname == zip_filename or arcname.endswith(zip_filename):
                continue

            zipf.write(filepath, arcname)
            file_count += 1

print(f"Successfully created {zip_filename} with {file_count} files.")
size_mb = os.path.getsize(zip_filename) / (1024 * 1024)
print(f"File size: {size_mb:.2f} MB")
