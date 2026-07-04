"use client";

import Image from "next/image";
import Link from "next/link";
import { Form, Field, useFormik, FormikProvider } from "formik";
import { AuthCard, AuthIllustration, AuthLayout } from "@/components/auth";
import { useLogin } from "@/hooks/useAuth";
import { toFormikValidationSchema } from "zod-formik-adapter";
import { loginSchema } from "@/lib/validators";

const LoginPage = () => {
  const { mutate, isPending, error } = useLogin();

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    onSubmit: (values) => {
      mutate(values);
    },
    validationSchema: toFormikValidationSchema(loginSchema),
  });

  const { errors, touched } = formik;

  return (
    <AuthLayout
      left={
        <AuthIllustration
          src="/assets/images/login.png"
          alt="Login"
          width={633}
          height={520}
        />
      }
      right={
        <AuthCard title="Login to your account" subtitle="Welcome back">
          <button type="button" className="_social_login_content_btn _mar_b40">
            <Image
              src="/assets/images/google.svg"
              alt="Google"
              width={20}
              height={20}
              className="_google_img"
            />
            <span>Or sign-in with google</span>
          </button>
          <div className="_social_login_content_bottom_txt _mar_b40">
            <span>Or</span>
          </div>
          <FormikProvider value={formik}>
            <Form className="_social_login_form">
              <div className="row">
                <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12">
                  <div className="_social_login_form_input _mar_b14">
                    <label className="_social_login_label _mar_b8">Email</label>
                    <Field
                      type="email"
                      name="email"
                      className="form-control _social_login_input"
                    />
                    {touched.email && errors.email ? (
                      <p className="_social_login_form_left_para">
                        {errors.email}
                      </p>
                    ) : null}
                  </div>
                </div>
                <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12">
                  <div className="_social_login_form_input _mar_b14">
                    <label className="_social_login_label _mar_b8">
                      Password
                    </label>
                    <Field
                      type="password"
                      name="password"
                      className="form-control _social_login_input"
                    />
                    {touched.password && errors.password ? (
                      <p className="_social_login_form_left_para">
                        {errors.password}
                      </p>
                    ) : null}
                  </div>
                </div>
              </div>
              <div className="row">
                <div className="col-lg-6 col-xl-6 col-md-6 col-sm-12">
                  <div className="form-check _social_login_form_check">
                    <Field
                      id="remember"
                      className="form-check-input _social_login_form_check_input"
                      type="radio"
                      name="remember"
                    />
                    <label
                      className="form-check-label _social_login_form_check_label"
                      htmlFor="remember"
                    >
                      Remember me
                    </label>
                  </div>
                </div>
                <div className="col-lg-6 col-xl-6 col-md-6 col-sm-12">
                  <div className="_social_login_form_left">
                    <p className="_social_login_form_left_para">
                      Forgot password?
                    </p>
                  </div>
                </div>
              </div>
              <div className="row">
                <div className="col-lg-12 col-md-12 col-xl-12 col-sm-12">
                  <div className="_social_login_form_btn _mar_t40 _mar_b60">
                    <button
                      type="submit"
                      className="_social_login_form_btn_link _btn1"
                      disabled={isPending}
                    >
                      {isPending ? "Logging in..." : "Login now"}
                    </button>
                  </div>
                </div>
              </div>
            </Form>
          </FormikProvider>
          {error ? (
            <p className="_social_login_form_left_para">
              Login failed. Please try again.
            </p>
          ) : null}
          <div className="row">
            <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12">
              <div className="_social_login_bottom_txt">
                <p className="_social_login_bottom_txt_para">
                  Dont have an account?{" "}
                  <Link href="/auth/register">Create New Account</Link>
                </p>
              </div>
            </div>
          </div>
        </AuthCard>
      }
    />
  );
};

export default LoginPage;