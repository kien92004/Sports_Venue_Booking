// src/components/CustomCard.tsx
import React from "react";

interface CustomCardProps {
  id: number | string;
  title: string;
  link?: string;
  image?: string;
  badgeText?: string;
  badgeColor?: string; // bootstrap bg-success, bg-danger, ...
  description?: string;
  extraInfo?: React.ReactNode; // thêm thông tin đặc biệt (VD: đã bán, ngày giờ, ...)
  buttonText?: string;
  buttonColor?: string; 
   onClick?: () => void;
}

export default function CustomCard({
  title,
  link,
  image,
  badgeText,
  badgeColor = "bg-primary",
  description,
  extraInfo,
  buttonText,
  buttonColor = "btn-primary",
  onClick
}: CustomCardProps) {
  const [imageError, setImageError] = React.useState(false);

  return (
    <div className="card h-100 shadow-sm border-0 rounded-3 overflow-hidden">
      <div className="position-relative">
        <img
          src={imageError ? "/user/images/default.png" : image}
          alt={title}
          className="card-img-top"
          style={{ height: "200px", objectFit: "cover" }}
          onError={() => setImageError(true)}
        />
        {badgeText && (
          <span className={`position-absolute top-0 end-0 m-2 badge ${badgeColor} rounded-pill`}>
            {badgeText}
          </span>
        )}
      </div>
      <div className="card-body d-flex flex-column">
        <h5 className="card-title fw-bold">
          <a href={link} className="text-decoration-none text-dark">
            {title}
          </a>
        </h5>

        {extraInfo && <div className="mb-2 small text-muted">{extraInfo}</div>}

        {description && (
          <p
            className="card-text text-muted small flex-grow-1"
            style={{
              display: "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical",
              overflow: "hidden"
            }}
          >
            {description}
          </p>
        )}

        <a href={link} className={`btn ${buttonColor} rounded-pill`} onClick={onClick}>
          <i className="fas fa-eye me-1"></i>
          {buttonText}
        </a>
      </div>
    </div>
  );
}
