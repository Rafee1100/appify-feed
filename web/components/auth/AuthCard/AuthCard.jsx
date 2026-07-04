import Image from "next/image";

const AuthCard = ({ title, subtitle, children, variant = "login" }) => {
  const isRegister = variant === "register";

  return (
    <div className={isRegister ? "_social_registration_content" : "_social_login_content"}>
      <div
        className={
          isRegister
            ? "_social_registration_right_logo _mar_b28"
            : "_social_login_left_logo _mar_b28"
        }
      >
        <Image
          src="/assets/images/logo.svg"
          alt="Buddy Script"
          width={161}
          height={40}
          className={isRegister ? "_right_logo" : "_left_logo"}
        />
      </div>
      <p
        className={
          isRegister
            ? "_social_registration_content_para _mar_b8"
            : "_social_login_content_para _mar_b8"
        }
      >
        {subtitle}
      </p>
      <h4
        className={
          isRegister
            ? "_social_registration_content_title _titl4 _mar_b50"
            : "_social_login_content_title _titl4 _mar_b50"
        }
      >
        {title}
      </h4>
      {children}
    </div>
  );
};

export default AuthCard;