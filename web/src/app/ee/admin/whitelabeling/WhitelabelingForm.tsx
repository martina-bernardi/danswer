"use client";

import { useRouter } from "next/navigation";
import { EnterpriseSettings } from "@/app/admin/settings/interfaces";
import { useContext, useState } from "react";
import { SettingsContext } from "@/components/settings/SettingsProvider";
import { Form, Formik } from "formik";
import * as Yup from "yup";
import {
  Label,
  SubLabel,
  TextFormField,
} from "@/components/admin/connectors/Field";
import { Button, Divider } from "@tremor/react";
import { ImageUpload } from "./ImageUpload";

export function WhitelabelingForm() {
  const router = useRouter();
  const [selectedLogo, setSelectedLogo] = useState<File | null>(null);
  const [selectedLogotype, setSelectedLogotype] = useState<File | null>(null);

  const settings = useContext(SettingsContext);
  if (!settings) {
    return null;
  }
  const enterpriseSettings = settings.enterpriseSettings;

  async function updateEnterpriseSettings(newValues: EnterpriseSettings) {
    const response = await fetch("/api/admin/enterprise-settings", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...(enterpriseSettings || {}),
        ...newValues,
      }),
    });
    if (response.ok) {
      router.refresh();
    } else {
      const errorMsg = (await response.json()).detail;
      alert(`Failed to update settings. ${errorMsg}`);
    }
  }

  return (
    <div>
      <Formik
        initialValues={{
          application_name: enterpriseSettings?.application_name || null,
          use_custom_logo: enterpriseSettings?.use_custom_logo || false,
          use_custom_logotype: enterpriseSettings?.use_custom_logotype || false,

          custom_header_content:
            enterpriseSettings?.custom_header_content || "",
          custom_popup_header: enterpriseSettings?.custom_popup_header || "",
          custom_popup_content: enterpriseSettings?.custom_popup_content || "",
          custom_lower_disclaimer_content:
            enterpriseSettings?.custom_lower_disclaimer_content || "",
        }}
        validationSchema={Yup.object().shape({
          application_name: Yup.string().nullable(),
          use_custom_logo: Yup.boolean().required(),
          use_custom_logotype: Yup.boolean().required(),
          custom_header_content: Yup.string().nullable(),
          custom_popup_header: Yup.string().nullable(),
          custom_popup_content: Yup.string().nullable(),
          custom_lower_disclaimer_content: Yup.string().nullable(),
        })}
        onSubmit={async (values, formikHelpers) => {
          formikHelpers.setSubmitting(true);

          if (selectedLogo) {
            values.use_custom_logo = true;

            const formData = new FormData();
            formData.append("file", selectedLogo);
            setSelectedLogo(null);
            const response = await fetch(
              "/api/admin/enterprise-settings/logo",
              {
                method: "PUT",
                body: formData,
              }
            );
            if (!response.ok) {
              const errorMsg = (await response.json()).detail;
              alert(`Failed to upload logo. ${errorMsg}`);
              formikHelpers.setSubmitting(false);
              return;
            }
          }

          if (selectedLogotype) {
            values.use_custom_logotype = true;

            const formData = new FormData();
            formData.append("file", selectedLogotype);
            setSelectedLogo(null);
            const response = await fetch(
              "/api/admin/enterprise-settings/logo?is_logotype=true",
              {
                method: "PUT",
                body: formData,
              }
            );
            if (!response.ok) {
              const errorMsg = (await response.json()).detail;
              alert(`Failed to upload logo. ${errorMsg}`);
              formikHelpers.setSubmitting(false);
              return;
            }
          }

          formikHelpers.setValues(values);
          await updateEnterpriseSettings(values);
        }}
      >
        {({ isSubmitting, values, setValues }) => (
          <Form>
            <TextFormField
              label="Application Name"
              name="application_name"
              subtext={`The custom name you are giving Danswer for your organization. This will replace 'Danswer' everywhere in the UI.`}
              placeholder="Custom name which will replace 'Danswer'"
              disabled={isSubmitting}
            />

            <Label>Custom Logo</Label>

            {values.use_custom_logo ? (
              <div className="mt-3">
                <SubLabel>Current Custom Logo: </SubLabel>
                <img
                  src={"/api/enterprise-settings/logo?u=" + Date.now()}
                  alt="logo"
                  style={{ objectFit: "contain" }}
                  className="w-32 h-32 mb-10 mt-4"
                />

                <Button
                  color="red"
                  size="xs"
                  type="button"
                  className="mb-8"
                  onClick={async () => {
                    const valuesWithoutLogo = {
                      ...values,
                      use_custom_logo: false,
                    };
                    await updateEnterpriseSettings(valuesWithoutLogo);
                    setValues(valuesWithoutLogo);
                  }}
                >
                  Delete
                </Button>

                <SubLabel>
                  Override the current custom logo by uploading a new image
                  below and clicking the Update button.
                </SubLabel>
              </div>
            ) : (
              <SubLabel>
                Specify your own logo to replace the standard Danswer logo.
              </SubLabel>
            )}
            <ImageUpload
              selectedFile={selectedLogo}
              setSelectedFile={setSelectedLogo}
            />
            <br />
            <Label>Custom Logotype</Label>

            {values.use_custom_logotype ? (
              <div className="mt-3">
                <SubLabel>Current Custom Logotype: </SubLabel>
                <img
                  src={"/api/enterprise-settings/logotype?u=" + Date.now()}
                  alt="logotype"
                  style={{ objectFit: "contain" }}
                  className="w-32 h-32 mb-10 mt-4"
                />

                <Button
                  color="red"
                  size="xs"
                  type="button"
                  className="mb-8"
                  onClick={async () => {
                    const valuesWithoutLogotype = {
                      ...values,
                      use_custom_logotype: false,
                    };
                    await updateEnterpriseSettings(valuesWithoutLogotype);
                    setValues(valuesWithoutLogotype);
                  }}
                >
                  Delete
                </Button>

                <SubLabel>
                  Override the current custom logotype by uploading a new image
                  below and clicking the Update button. This logotype is the
                  text-based logo that will be rendered at the bottom right of
                  the chat screen.
                </SubLabel>
              </div>
            ) : (
              <SubLabel>Specify your own logotype</SubLabel>
            )}
            <ImageUpload
              selectedFile={selectedLogotype}
              setSelectedFile={setSelectedLogotype}
            />

            <Divider />

            <div className="mt-4">
              <TextFormField
                label="Custom Chat Header Content"
                name="custom_header_content"
                subtext={`Custom Markdown content that will be displayed as a banner at the top of the Chat page.`}
                placeholder="Your header content..."
                disabled={isSubmitting}
              />
            </div>

            <Divider />

            <div className="mt-4">
              <TextFormField
                label="Custom Popup Header"
                name="custom_popup_header"
                subtext={`The title for the popup that will be displayed for each user on their initial visit 
                to the application. If left blank AND Custom Popup Content is specified, will use "Welcome to ${
                  values.application_name || "Danswer"
                }!".`}
                placeholder="Initial Popup Header"
                disabled={isSubmitting}
              />
            </div>

            <div className="mt-4">
              <TextFormField
                label="Custom Popup Content"
                name="custom_popup_content"
                subtext={`Custom Markdown content that will be displayed as a popup on initial visit to the application.`}
                placeholder="Your popup content..."
                isTextArea
                disabled={isSubmitting}
              />
            </div>

            <div className="mt-4">
              <TextFormField
                label="Custom Footer"
                name="custom_lower_disclaimer_content"
                subtext={`Custom Markdown content that will be displayed at the bottom of the Chat page.`}
                placeholder="Your disclaimer content..."
                isTextArea
                disabled={isSubmitting}
              />
            </div>

            <Button type="submit" className="mt-4">
              Update
            </Button>
          </Form>
        )}
      </Formik>
    </div>
  );
}
