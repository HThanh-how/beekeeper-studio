import { LicenseKey } from "@/common/appdb/models/LicenseKey";
import platformInfo from "@/common/platform_info";
import { TransportLicenseKey } from "@/common/transport";
import { CloudClient } from "@/lib/cloud/CloudClient";
import { LicenseStatus } from "@/lib/license";

export interface ILicenseHandlers {
  "license/createTrialLicense": () => Promise<void>;
  "license/getStatus": () => Promise<LicenseStatus>;
  "license/add": ({ email, key }: { email: string; key: string; }) => Promise<TransportLicenseKey>;
  "license/get": () => Promise<TransportLicenseKey[]>;
  "license/remove": (({ id }: { id: number }) => Promise<void>)
}

export const LicenseHandlers: ILicenseHandlers = {
  "license/createTrialLicense": async function () {
    await LicenseKey.createTrialLicense();
  },
  "license/remove": async function({ id }){
    const key = await LicenseKey.findOneBy({ id })
    if (key) {
      await key.remove()
    }
  },
  "license/getStatus": async function () {
    const status = await LicenseKey.getLicenseStatus();
    return {
      ...status,
      isUltimate: true,
      isCommunity: false,
      isTrial: false,
      isValidDateExpired: false,
      isSupportDateExpired: false,
      maxAllowedVersion: { major: 1000000, minor: 0, patch: 0 },
    };
  },
  "license/add": async function ({ email, key }: { email: string; key: string; }) {
    // const result = await CloudClient.getLicense( platformInfo.cloudUrl, email, key);
    // // if we got here, license is good.
    await LicenseKey.wipe();
    const license = new LicenseKey();
    license.key = key;
    license.email = email;
    license.validUntil = new Date(2099, 11, 31);
    license.supportUntil = new Date(2099, 11, 31);
    license.maxAllowedAppRelease = { tagName: "1000000" };
    license.licenseType = "BusinessLicense";
    await license.save();
    return license;
  },
  "license/get": async function () {
    return await LicenseKey.find();
  }
};
