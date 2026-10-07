import { useEffect } from "react";

const SITE_NAME = "Fully Governed";
const SITE_URL = "https://www.fullygoverned.co.uk";
const DEFAULT_IMAGE = `${SITE_URL}/social-preview.png`;

interface SEOProps {
    title: string;
    description?: string;
    image?: string;
    url?: string;
}

export function useSEO({ title, description, image, url }: SEOProps) {
    useEffect(() => {
        const pageTitle = title === "Fully Governed Studios" ? title : `${title} | ${SITE_NAME}`;
        const pageUrl = url || SITE_URL;
        const pageImage = image || DEFAULT_IMAGE;

        // Basic meta tags
        document.title = pageTitle;

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

        const setTwitter = (name: string, content: string) => {
            let twitterTag = document.querySelector(`meta[name="${name}"]`);
            if (!twitterTag) {
                twitterTag = document.createElement("meta");
                twitterTag.setAttribute("name", name);
                document.head.appendChild(twitterTag);
            }
            twitterTag.setAttribute("content", content);
        };

        setOpenGraph("og:site_name", SITE_NAME);
        setOpenGraph("og:title", pageTitle);
        if (description) setOpenGraph("og:description", description);
        setOpenGraph("og:image", pageImage);
        setOpenGraph("og:url", pageUrl);

        setTwitter("twitter:card", "summary_large_image");
        setTwitter("twitter:title", pageTitle);
        if (description) setTwitter("twitter:description", description);
        setTwitter("twitter:image", pageImage);
        setTwitter("twitter:url", pageUrl);

    }, [title, description, image, url]);
}
