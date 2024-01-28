

export interface ManifestFile {
    short_name: string;
    name: string;
    version: string;
    description: string;
    github_url: string;
    license_name: string;
    license_url: string;
}


export const getManifest = async () => {
    try {
        return await fetch("/manifest.json")
        .then((response) => response.json())
        .then((data) => {
          return data as Partial<ManifestFile>;
        });
    } catch (error) {
        console.log(error);
    }
};
