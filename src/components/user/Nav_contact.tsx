type Props = {
  title: string;
};


export default function Nav_contact({ title }: Props)  {
    return (  
    <section className="hero-wrap hero-wrap-2" style={{ backgroundImage: `url('/user/images/about.jpg')`, backgroundSize: 'cover' }} data-stellar-background-ratio="0.5">
        <div className="overlay"></div>
        <div className="container slider-text" >
          <div className="row no-gutters align-items-center justify-content-center min-vh-100">
            <div className="col-md-9 mb-5 text-center">
              <p className="breadcrumbs mb-0 text-center">
                <span className="mr-2 "><a href="/sportify/contact">Liên hệ <i className="fa fa-chevron-right"></i></a></span>
                <span className="m-2"><a href="/sportify/policy">Chính sách <i className="fa fa-chevron-right"></i></a></span>
                <span className="m-2"><a href="/sportify/regulations">Quy định <i className="fa fa-chevron-right"></i></a></span>
              </p>
              <h2 className="mb-0 bread text-center">{title}</h2>
            </div>
          </div>
        </div>
      </section>

);
}