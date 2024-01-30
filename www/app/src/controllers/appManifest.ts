export interface ManifestFile {
  short_name: string;
  name: string;
  description: string;
  version: string;
  github_url: string;
  license_name: string;
  license_url: string;
}

let data: null | Partial<ManifestFile> = null;

export const getManifest = () => {
  if (data) return data;
  const manifest = fetch("/manifest.json")
    .then((res) => res.json() as Promise<ManifestFile>)
    .then((res) => {
      data = res;
      return res;
    });
};
