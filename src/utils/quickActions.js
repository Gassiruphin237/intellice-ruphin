import { FileDown, Phone, Mail } from "lucide-react";

export const CONTACT_INFO = {
  cvUrl: "/cv-ruphin.pdf",
  phone: "+23767814134",
  email: "gassiruphin@gmail.com"
};

export const QUICK_ACTIONS = [
  {
    id: "download_cv",
    label: "Télécharger CV",
    Icon: FileDown,
    keywords: ["télécharger", "telecharger", "cv", "curriculum"],
    run: async () => {
      try {
        // Récupération du fichier depuis le dossier public
        const response = await fetch(CONTACT_INFO.cvUrl);
        if (!response.ok) throw new Error("Fichier PDF introuvable dans le dossier public");

        // Conversion en Blob binaire pour éviter le fichier corrompu
        const blob = await response.blob();
        const blobUrl = window.URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = "CV_Ruphin.pdf";
        document.body.appendChild(link);
        link.click();

        // Nettoyage de l'élément et de l'URL mémoire
        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);
      } catch (error) {
        console.error("Erreur lors du téléchargement :", error);
        // Solution de secours : ouverture dans un nouvel onglet
        window.open(CONTACT_INFO.cvUrl, "_blank");
      }
    }
  },
  {
    id: "call",
    label: "Appeler Ruphin",
    Icon: Phone,
    keywords: ["appeler", "appel", "téléphoner", "telephoner", "numéro", "numero"],
    run: () => {
      window.location.href = `tel:${CONTACT_INFO.phone}`;
    }
  },
  {
    id: "email",
    label: "Envoyer un e-mail",
    Icon: Mail,
    keywords: ["email", "e-mail", "mail", "écrire", "ecrire", "message"],
    run: () => {
      window.location.href = `mailto:${CONTACT_INFO.email}?subject=Prise%20de%20contact%20via%20CV%20AI`;
    }
  }
];

export const matchQuickAction = (text) => {
  if (!text) return null;
  const lowerText = text.toLowerCase();
  return QUICK_ACTIONS.find((action) =>
    action.keywords.some((keyword) => lowerText.includes(keyword))
  );
};