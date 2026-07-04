import Image from "next/image";

const AuthIllustration = ({
  src,
  alt,
  width,
  height,
  variant = "login",
  overlaySrc,
  overlayAlt,
  overlayWidth,
  overlayHeight,
}) => {
  if (variant === "register") {
    return (
      <div className="_social_registration_right">
        <div className="_social_registration_right_image">
          <Image src={src} alt={alt} width={width} height={height} priority />
        </div>
        {overlaySrc ? (
          <div className="_social_registration_right_image_dark">
            <Image
              src={overlaySrc}
              alt={overlayAlt || ""}
              width={overlayWidth || 180}
              height={overlayHeight || 140}
            />
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className="_social_login_left">
      <div className="_social_login_left_image">
        <Image src={src} alt={alt} width={width} height={height} className="_left_img" priority />
      </div>
    </div>
  );
};

export default AuthIllustration;