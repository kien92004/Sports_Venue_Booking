type Breadcrumb = {
  label: string;
  href?: string; // nếu có thì render link, không thì chỉ hiển thị text
};

type HeroSectionProps = {
  backgroundImage: string;   // URL ảnh nền
  title: string;             // Tiêu đề chính (vd: "Chi tiết đội")
  breadcrumbs: Breadcrumb[]; // Danh sách breadcrumbs
};

export default function HeroSection({
  backgroundImage,
  title,
  breadcrumbs,
}: HeroSectionProps) {
  return (
    <section
      className="hero-wrap hero-wrap-2"
      style={{ backgroundImage: `url('${backgroundImage}')` }}
      data-stellar-background-ratio="0.5"
    >
      <div className="overlay"></div>
      <div className="container slider-text">
        <div className="row no-gutters align-items-end justify-content-center " style={{ height: '400px' }}>
          <div className="col-md-9 mb-5 text-center">
            <p className="breadcrumbs mb-0">
              {breadcrumbs.map((bc, idx) => (
                <span key={idx} className="mr-2">
                  {bc.href ? (
                    <a href={bc.href}>
                      {bc.label} <i className="fa fa-chevron-right"></i>
                    </a>
                  ) : (
                    bc.label
                  )}
                </span>
              ))}
            </p>
            <h2 className="mb-0 bread">{title}</h2>
          </div>
        </div>
      </div>
    </section>
  );
}
