const getImageUrl = (image: string | null) => {
  if (!image) return "/user/images/avatar_default.png";

  const trimmed = image.trim();
  if (!trimmed) return "/user/images/default.png";

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  if (trimmed.startsWith("v") || trimmed.includes("/")) {
    return `${import.meta.env.VITE_CLOUDINARY_BASE_URL}/${trimmed}`;
  }

  return `/user/images/${trimmed}`;
};

export default getImageUrl;
