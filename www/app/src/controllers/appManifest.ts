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

export const getManifest = async () => {
  if (data) return data;
  const manifest = await fetch("/manifest.json");
  return manifest.json();
};
