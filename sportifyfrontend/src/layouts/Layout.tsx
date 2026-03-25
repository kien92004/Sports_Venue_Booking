import { Helmet } from "@dr.pogodin/react-helmet";
import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import AIChatbox from "../components/Others/AIChatbox";
import Footer from "../components/user/Footer";
import Header from "../components/user/Header";
import Navbar from "../components/user/Navbar";
import { loadScript } from "../helper/LoadScript";
import { CartProvider } from "../helper/useCartCount";

export default function Layout() {
  const arrayScript = [
    "/user/js/jquery.min.js",
    "/user/js/jquery-migrate-3.0.1.min.js",
    "/user/js/popper.min.js",
    "/user/js/bootstrap.min.js",
    "/user/js/jquery.easing.1.3.js",
    "/user/js/jquery.waypoints.min.js",
    "/user/js/jquery.stellar.min.js",
    "/user/js/owl.carousel.min.js",
    "/user/js/jquery.magnific-popup.min.js",
    "/user/js/jquery.animateNumber.min.js",
    "/user/js/scrollax.min.js",
    "/user/js/main.js",
  ]
  useEffect(() => {
    async function loadScripts() {
      try {
        for (const src of arrayScript) {
          await loadScript(src);
        }
      } catch (e) {
        console.error("load script failed : ", e)
      }
    }
    loadScripts();
  }, [])

  return (
    <>
      <Helmet>
        <title>Sportify</title>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Spectral:wght@200;300;400;500;700;800&display=swap"
        />
        <link
          rel="stylesheet"
          href="https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css"
        />
        <link rel="stylesheet" href="/user/css/owl.carousel.min.css" />
        <link rel="stylesheet" href="/user/css/animate.css" />
        <link rel="stylesheet" href="/user/css/owl.theme.default.min.css" />
        <link rel="stylesheet" href="/user/css/magnific-popup.css" />
        <link rel="stylesheet" href="/user/css/flaticon.css" />
        <link rel="stylesheet" href="/user/css/style.css" />

      </Helmet>

      <CartProvider>
        <div className="d-flex flex-column min-vh-100">
          {/* Header */}
          <Header />
          <Navbar />

          {/* Content thay đổi */}
          <main className="flex-fill">
            <Outlet />
          </main>

          {/* Chatbox AI */}
          <AIChatbox /> {/* Thêm dòng này */}

          {/* Footer */}
          <Footer />
        </div>
      </CartProvider>
    </>

  );


}
