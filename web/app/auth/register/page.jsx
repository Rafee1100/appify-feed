"use client";

import Image from "next/image";
import Link from "next/link";
import { Form, Field, FormikProvider, useFormik } from "formik";
import { AuthCard, AuthIllustration, AuthLayout } from "@/components/auth";
import { useRegister } from "@/hooks/useAuth";
import { toFormikValidationSchema } from "zod-formik-adapter";
import { registerSchema } from "@/lib/validators";

const RegisterPage = () => {
  const { mutate, isPending, error } = useRegister();

  const formik = useFormik({
    initialValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
    },
    validationSchema: toFormikValidationSchema(registerSchema),
    onSubmit: (values) => {
      mutate(values);
    },
  });

  const { errors, touched } = formik;

  return (
    <AuthLayout
      variant="register"
      left={
        <AuthIllustration
          src="/assets/images/registration.png"
          alt="Register"
          width={633}
          height={520}
          variant="register"
          overlaySrc="/assets/images/registration1.png"
          overlayAlt="Decoration"
          overlayWidth={180}
          overlayHeight={140}
        />
      }
      right={
        <AuthCard
          title="Registration"
          subtitle="Get Started Now"
          variant="register"
        >
          <button
            type="button"
            className="_social_registration_content_btn _mar_b40"
          >
            <Image
              src="/assets/images/google.svg"
              alt="Google"
              width={20}
              height={20}
              className="_google_img"
            />
            <span>Register with google</span>
          </button>
          <div className="_social_registration_content_bottom_txt _mar_b40">
            <span>Or</span>
          </div>
          <FormikProvider value={formik}>
            <Form className="_social_registration_form">
              <div className="row">
                <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12">
                  <div className="_social_registration_form_input _mar_b14">
                    <label className="_social_registration_label _mar_b8">
                      First name
                    </label>
                    <Field
                      type="text"
                      name="firstName"
                      className="form-control _social_registration_input"
                    />
                    {touched.firstName && errors.firstName ? (
                      <p className="_social_registration_form_left_para">
                        {errors.firstName}
                      </p>
                    ) : null}
                  </div>
                </div>
                <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12">
                  <div className="_social_registration_form_input _mar_b14">
                    <label className="_social_registration_label _mar_b8">
                      Last name
                    </label>
                    <Field
                      type="text"
                      name="lastName"
                      className="form-control _social_registration_input"
                    />
                    {touched.lastName && errors.lastName ? (
                      <p className="_social_registration_form_left_para">
                        {errors.lastName}
                      </p>
                    ) : null}
                  </div>
                </div>
                <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12">
                  <div className="_social_registration_form_input _mar_b14">
                    <label className="_social_registration_label _mar_b8">
                      Email
                    </label>
                    <Field
                      type="email"
                      name="email"
                      className="form-control _social_registration_input"
                    />
                    {touched.email && errors.email ? (
                      <p className="_social_registration_form_left_para">
                        {errors.email}
                      </p>
                    ) : null}
                  </div>
                </div>
                <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12">
                  <div className="_social_registration_form_input _mar_b14">
                    <label className="_social_registration_label _mar_b8">
                      Password
                    </label>
                    <Field
                      type="password"
                      name="password"
                      className="form-control _social_registration_input"
                    />
                    {touched.password && errors.password ? (
                      <p className="_social_registration_form_left_para">
                        {errors.password}
                      </p>
                    ) : null}
                  </div>
                </div>
              </div>
              <div className="row">
                <div className="col-lg-12 col-xl-12 col-md-12 col-sm-12">
                  <div className="form-check _social_registration_form_check">
                    <Field
                      id="agree"
                      className="form-check-input _social_registration_form_check_input"
                      type="radio"
                      name="agree"
                    />
                    <label
                      className="form-check-label _social_registration_form_check_label"
                      htmlFor="agree"
                    >
                      I agree to terms & conditions
                    </label>
                  </div>
                </div>
              </div>
              <div className="row">
                <div className="col-lg-12 col-md-12 col-xl-12 col-sm-12">
                  <div className="_social_registration_form_btn _mar_t40 _mar_b60">
                    <button
                      type="submit"
                      className="_social_registration_form_btn_link _btn1"
                      disabled={isPending}
                    >
                      {isPending ? "Creating..." : "Register"}
                    </button>
                  </div>
                </div>
              </div>
            </Form>
          </FormikProvider>
          {error ? (
            <p className="_social_registration_form_left_para">
              Registration failed. Please try again.
            </p>
          ) : null}
          <div className="row">
            <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12">
              <div className="_social_registration_bottom_txt">
                <p className="_social_registration_bottom_txt_para">
                  Already have an account? <Link href="/auth/login">Login</Link>
                </p>
              </div>
            </div>
          </div>
        </AuthCard>
      }
    />
  );
};

export default RegisterPage;