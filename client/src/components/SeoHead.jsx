import { useEffect } from 'react';

export default function SeoHead({
  title = 'ZXAAA - Hyperlocal Buy, Sell & Swap Marketplace',
  description = 'Buy, sell, and swap items near you on ZXAAA. Instant QR verification, verified sellers, and local pickup.',
  keywords = 'marketplace, buy used items, sell products, swap deals, local marketplace, ZXAAA',
  canonicalUrl,
  image = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop',
  type = 'website',
  productData = null
}) {
  useEffect(() => {
    // Dynamic Document Title
    document.title = title;

    // Helper to set/update meta tag
    const setMetaTag = (selector, attribute, attrValue, content) => {
      let element = document.querySelector(selector);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, attrValue);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // Standard Meta Tags
    setMetaTag('meta[name="description"]', 'name', 'description', description);
    setMetaTag('meta[name="keywords"]', 'name', 'keywords', keywords);

    // Open Graph Meta Tags
    setMetaTag('meta[property="og:title"]', 'property', 'og:title', title);
    setMetaTag('meta[property="og:description"]', 'property', 'og:description', description);
    setMetaTag('meta[property="og:image"]', 'property', 'og:image', image);
    setMetaTag('meta[property="og:type"]', 'property', 'og:type', type);
    
    const currentUrl = canonicalUrl || window.location.href;
    setMetaTag('meta[property="og:url"]', 'property', 'og:url', currentUrl);

    // Canonical Link Tag
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', currentUrl);

    // Schema.org JSON-LD Structured Data
    let jsonLdScript = document.querySelector('#zxaaa-jsonld-schema');
    if (productData) {
      const schemaData = {
        '@context': 'https://schema.org/',
        '@type': 'Product',
        name: productData.title || title,
        description: productData.description || description,
        category: productData.category || 'General',
        image: productData.images && productData.images.length > 0 ? productData.images : [image],
        offers: {
          '@type': 'Offer',
          priceCurrency: 'INR',
          price: productData.price || 0,
          itemCondition: productData.condition === 'New' ? 'https://schema.org/NewCondition' : 'https://schema.org/UsedCondition',
          availability: productData.status === 'ACTIVE' ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
          seller: {
            '@type': 'Person',
            name: productData.seller?.name || 'Verified Seller'
          }
        }
      };

      if (!jsonLdScript) {
        jsonLdScript = document.createElement('script');
        jsonLdScript.id = 'zxaaa-jsonld-schema';
        jsonLdScript.type = 'application/ld+json';
        document.head.appendChild(jsonLdScript);
      }
      jsonLdScript.textContent = JSON.stringify(schemaData);
    } else if (jsonLdScript) {
      jsonLdScript.remove();
    }

  }, [title, description, keywords, canonicalUrl, image, type, productData]);

  return null;
}
