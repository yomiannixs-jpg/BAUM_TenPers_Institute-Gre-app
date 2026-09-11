Why you saw 404:
The page requested /textbooks/ETS_Official_Guide_GRE_Third_Edition.pdf, but Python's local web server could not find a file at that exact path.

Fix:
Replace textbooks.html with this version. It checks both testmaterials/ and textbooks/, tries common filenames, and also provides a local file-picker fallback.
