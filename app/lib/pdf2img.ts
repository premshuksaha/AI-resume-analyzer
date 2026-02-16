export interface PdfConversionResult {
    imageUrl: string;
    file: File | null;
    error?: string;
}

let pdfjsLib: any = null;
let isLoading = false;
let loadPromise: Promise<any> | null = null;

async function loadPdfJs(): Promise<any> {
    if (pdfjsLib) return pdfjsLib;
    if (loadPromise) return loadPromise;

    isLoading = true;
    // Import the main library from the root package
    loadPromise = import("pdfjs-dist").then((lib) => {
        // Set the worker source to use local file
        // In version 5+, we might need to access GlobalWorkerOptions from the imported lib
        const workerPath = "pdf.worker.min.mjs";
        if (lib.GlobalWorkerOptions) {
            lib.GlobalWorkerOptions.workerSrc = workerPath;
        } else if (pdfjsLib?.GlobalWorkerOptions) {
            pdfjsLib.GlobalWorkerOptions.workerSrc = workerPath;
        }
        
        pdfjsLib = lib;
        isLoading = false;
        return lib;
    }).catch(err => {
        isLoading = false;
        loadPromise = null;
        throw new Error(`Failed to load PDF.js library: ${err.message}`);
    });

    return loadPromise;
}

export async function convertPdfToImage(
    file: File
): Promise<PdfConversionResult> {
    try {
        const lib = await loadPdfJs();

        if (!lib) {
            return { imageUrl: "", file: null, error: "PDF.js library failed to load" };
        }

        const arrayBuffer = await file.arrayBuffer();
        const loadingTask = lib.getDocument({ 
            data: arrayBuffer,
            // Add some common options for better compatibility
            useSystemFonts: true,
            stopAtErrors: false,
        });

        const pdf = await loadingTask.promise;
        
        if (pdf.numPages === 0) {
            return { imageUrl: "", file: null, error: "The PDF file has no pages" };
        }

        const page = await pdf.getPage(1);
        const viewport = page.getViewport({ scale: 2 }); // Reduced scale to 2 for better performance/memory
        
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");

        if (!context) {
            return { imageUrl: "", file: null, error: "Could not get canvas context" };
        }

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        context.imageSmoothingEnabled = true;
        context.imageSmoothingQuality = "high";

        const renderContext = {
            canvasContext: context,
            viewport: viewport,
        };

        await page.render(renderContext).promise;

        return new Promise((resolve) => {
            canvas.toBlob(
                (blob) => {
                    if (blob) {
                        // Create a File from the blob with the same name as the pdf
                        const originalName = file.name.replace(/\.pdf$/i, "");
                        const imageFile = new File([blob], `${originalName}.png`, {
                            type: "image/png",
                        });

                        resolve({
                            imageUrl: URL.createObjectURL(blob),
                            file: imageFile,
                        });
                    } else {
                        resolve({
                            imageUrl: "",
                            file: null,
                            error: "Failed to create image blob from canvas",
                        });
                    }
                },
                "image/png",
                0.9 // Slightly reduced quality to save space
            );
        });
    } catch (err: any) {
        console.error("PDF Conversion Error:", err);
        return {
            imageUrl: "",
            file: null,
            error: err.message || String(err),
        };
    }
}