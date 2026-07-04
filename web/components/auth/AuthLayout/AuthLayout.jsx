import Image from "next/image";

const AuthLayout = ({ left, right, variant = "login" }) => {
  const isRegister = variant === "register";

  return (
    <section
      className={`${
        isRegister ? "_social_registration_wrapper" : "_social_login_wrapper"
      } _layout_main_wrapper`}
    >
      <div className="_shape_one">
        <Image src="/assets/images/shape1.svg" alt="" width={192} height={192} className="_shape_img" />
        <Image src="/assets/images/dark_shape.svg" alt="" width={96} height={96} className="_dark_shape" />
      </div>
      <div className="_shape_two">
        <Image src="/assets/images/shape2.svg" alt="" width={160} height={160} className="_shape_img" />
        <Image
          src="/assets/images/dark_shape1.svg"
          alt=""
          width={96}
          height={96}
          className="_dark_shape _dark_shape_opacity"
        />
      </div>
      <div className="_shape_three">
        <Image src="/assets/images/shape3.svg" alt="" width={160} height={160} className="_shape_img" />
        <Image
          src="/assets/images/dark_shape2.svg"
          alt=""
          width={96}
          height={96}
          className="_dark_shape _dark_shape_opacity"
        />
      </div>
      <div className={isRegister ? "_social_registration_wrap" : "_social_login_wrap"}>
        <div className="container">
          <div className="row align-items-center">
            <div className="col-xl-8 col-lg-8 col-md-12 col-sm-12">{left}</div>
            <div className="col-xl-4 col-lg-4 col-md-12 col-sm-12">{right}</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AuthLayout;