import { useEffect } from "react";

interface SEOProps {
    title: string;
    description?: string;
    image?: string;
    url?: string;
}

export function useSEO({ title, description, image, url }: SEOProps) {
    useEffect(() => {
        // Basic meta tags
        document.title = `${title} | Ewisham Creative Suite`;

        if (description) {
            let metaDescription = document.querySelector('meta[name="description"]');
            if (!metaDescription) {
                metaDescription = document.createElement("meta");
                metaDescription.setAttribute("name", "description");
                document.head.appendChild(metaDescription);
            }
            metaDescription.setAttribute("content", description);
        }

        // Open Graph
        const setOpenGraph = (property: string, content: string) => {
            let ogTag = document.querySelector(`meta[property="${property}"]`);
            if (!ogTag) {
                ogTag = document.createElement("meta");
                ogTag.setAttribute("property", property);
                document.head.appendChild(ogTag);
            }
            ogTag.setAttribute("content", content);
        };

        setOpenGraph("og:title", `${title} | Ewisham Creative Suite`);
        if (description) setOpenGraph("og:description", description);
        if (image) setOpenGraph("og:image", image);
        if (url) setOpenGraph("og:url", url);

    }, [title, description, image, url]);
}
