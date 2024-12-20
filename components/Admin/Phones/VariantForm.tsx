"use client";

import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import { Input } from "@/components/ui/input";
import { FormError } from "@/components/shared/Form/FormError";
import { FormSuccess } from "@/components/shared/Form/FormSucess";
import { BottomGradient } from "@/components/ui/BottomGradient";
import { variantFormSchema } from "@/lib/validator";
// import {
//   addVariant,
//   deleteImage,
//   updateVariant,
// } from "@/lib/actions/variant.actions";
// import { getCountries } from "@/lib/actions/country.actions";
import { useUploadThing } from "@/lib/uploadthing";
import Image from "next/image";

type VariantFormProps = {
  userId: string | undefined;
  type: "add" | "edit";
  modelId?: string;
  variant?: {
    id: string;
    price: number;
    memory: number;
    color: string;
    country: string;
    description: string;
    stock: number;
    imageUrl: string[];
    isActive: boolean;
  };
  setIsModalOpen: (isOpen: boolean) => void;
};

export default function VariantForm({ userId, type, modelId, variant, setIsModalOpen } : VariantFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
 
  const [countries, setCountries] = useState<{ id: string; name: string }[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]); // Fichiers sélectionnés
  const [existingImages, setExistingImages] = useState<string[]>(variant?.imageUrl || []);
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([]); // Images à supprimer
  const { startUpload } = useUploadThing("imageUploader");

  console.log("SELECTEDFILES", selectedFiles);

  const variantId = variant?.id;
  console.log("imagesToDelete", imagesToDelete);

  useEffect(() => {
    const fetchCountry = async () => {
      try {
        const response = await fetch(
          `http://localhost:3000/api/country`,
          {
            headers: {
              method: "GET",
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error("Failed to fetch models");
        }

        const data = await response.json();
        setCountries(data);
      } catch (error) {
        console.error("Error fetching models:", error);
      }
    };
    fetchCountry();
  }, []);

 
  const initialValues =
    variant && type === "edit"
      ? {
          price: variant?.price,
          memory: variant?.memory,
          color: variant?.color,
          country: variant?.country,
          countryId: variant?.country,
          description: variant?.description,
          imageUrl: variant?.imageUrl,
          stock: variant?.stock,
          isActive: variant?.isActive,
          modelId: modelId,
        }
      : {
          price: 0,
          memory: 0,
          color: "",
          country: "",
          description: "",
          imageUrl: [],
          stock: 0,
          isActive: true,
          modelId: modelId || "",
        };

        const [isChecked, setIsChecked] = useState(initialValues.isActive);
    
     

  const form = useForm<z.infer<typeof variantFormSchema>>({
    resolver: zodResolver(variantFormSchema),
    defaultValues: initialValues,
    mode: "onSubmit",
  });

  useEffect(() => {
    setIsChecked(initialValues.isActive);
    console.log("initialValues.isActive", initialValues.isActive);
  }, [initialValues.isActive]);

  // useEffect(() => {
  //   if (initialValues.country) {
  //     form.setValue("country", initialValues.country); // Définir la valeur initiale
  //   }
  // }, [initialValues.country, form]);
  
  async function onSubmit(values: z.infer<typeof variantFormSchema>) {
    setError("");
    setSuccess("");

    if (type === "add") {
      try {

        if (!modelId) {
          setError("modelId est requis pour ajouter une variante.");
          return;
        }

        // Upload des fichiers
        let imageUrls: string[] = [];
        if (selectedFiles.length > 0) {
          const uploadedImages = await startUpload(selectedFiles, {
            variantId: modelId,
          });

          console.log("Images uploadées :", uploadedImages);

          if (!uploadedImages || uploadedImages.length === 0) {
            throw new Error("Échec de l'upload des images.");
          }

          imageUrls = uploadedImages.map((file) => file.url);
          console.log("URLs des images uploadées :", imageUrls);
        }

        if (imageUrls.length === 0) {
          setError("Aucune image n'a été uploadée.");
          return;
        }

        // Ajoute les URLs au formulaire
        values.imageUrl = imageUrls;

        // Crée la variante
        const response = await fetch(`/api/variants/${modelId}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            //modelId,
            memory: values.memory,
            color: values.color,
            countryId: values.country || null,
            price: values.price,
            description: values.description || "",
            stock: values.stock || 0,
            isActive: values.isActive ?? true,
            images: values.imageUrl, 
          }),
        });

      // Vérifiez la réponse
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Erreur lors de la création de la variante :", errorData);
        setError("Erreur lors de la création de la variante.");
        return;
      }
       
        setSelectedFiles([]);
        setSuccess("Variante et images ajoutées avec succès !");
        setIsModalOpen(false);
        window.location.href = window.location.href;
      } catch (error) {
        console.error("Erreur dans onSubmit :", error);
        setError("Erreur lors de l'ajout de la variante.");
      }
    }

    if (type === "edit") {
      try {
        if (!modelId) {
          setError("modelId est requis pour ajouter une variante.");
          return;
        }

        let imageUrls = values.imageUrl || [];

        if (selectedFiles.length > 0) {
          const uploadedImages = await startUpload(selectedFiles, {
            variantId: modelId,
          });

          if (!uploadedImages || uploadedImages.length === 0) {
            throw new Error("Échec de l'upload des images.");
          }

          const newImageUrls = uploadedImages.map((file) => file.url);
          imageUrls = [...newImageUrls];
        }

        values.imageUrl = imageUrls;

        if (!variantId) {
          setError("variantId est requis pour éditer une variante.");
          return;
        }

          // Modifier la variante
          const response = await fetch(`/api/variants/${modelId}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              variantId: variantId,
              memory: values.memory,
              color: values.color,
              countryId: values.country || initialValues.country.id,
              price: values.price,
              description: values.description || "",
              stock: values.stock || 0,
              isActive: values.isActive ?? true,
              images: imageUrls,
              imagesToDelete,
            }),
          });

           // Vérifiez la réponse
        if (!response.ok) {
          const errorData = await response.json();
          console.error("Erreur lors de la création de la variante :", errorData);
          setError("Erreur lors de la création de la variante.");
          return;
        }

        setSelectedFiles([]);
        setSuccess("Variante modifiée avec succès !");
        setIsModalOpen(false);
        router.refresh();
        window.location.href = window.location.href;
      } catch (error) {
        console.error("Erreur dans onSubmit :", error);
        setError("Erreur lors de l'édition de la variante.");
      }
    }
  }

  const handleRemoveSelectedFile = (fileName: string) => {
    setSelectedFiles((prevFiles) =>
      prevFiles.filter((file) => file.name !== fileName)
    );
  };

  const handleRemoveExistingImage = (imageUrl: string) => {
    setExistingImages((prevImages) =>
      prevImages.filter((url) => url !== imageUrl)
    );
    setImagesToDelete((prevImages) => [...prevImages, imageUrl]);
  };

  return (
    <div className="flex flex-col gap-8">
      <h3 className="flex gap-3 text-white text-xl font-font1 tracking-widest">
        {type === "add" ? "Ajouter un modèle |" : "Modifier un modèle |"}
        <div className="flex gap-2">
      <Input
          id="isActive"
          type="checkbox"
          className="h-5 w-5 mt-1"
          checked={isChecked} 
          {...form.register("isActive", {
            onChange: () => setIsChecked(!isChecked), 
          })}
        />
        <p>{isChecked ? "Actuellement actif" : "Actuellement désactivé"}</p>
          </div>
      </h3>

      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-4"
      >
        <div className="flex gap-4">
          <div>
            <label className="text-white text-sm" htmlFor="price">
              Prix
            </label>
            <Input
              id="price"
              type="number"
              className="text-noir-900"
              defaultValue={initialValues.price}
              {...form.register("price", { valueAsNumber: true })}
            />
          </div>

          <div>
            <label className="text-white text-sm" htmlFor="memory">
              Stockage
            </label>
            <Input
              id="memory"
              type="number"
              className="text-noir-900"
              defaultValue={initialValues.memory}
              {...form.register("memory", { valueAsNumber: true })}
            />
          </div>

          <div>
            <label className="text-white text-sm" htmlFor="color">
              Couleur
            </label>
            <Input
              id="color"
              placeholder="Blanc Neige"
              type="text"
              className="text-noir-900"
              defaultValue={initialValues.color}
              {...form.register("color")}
            />
          </div>

          <div className="">
            <label className="text-white text-sm" htmlFor="country">
            {!initialValues.country ? "-- Pays de provenance --" : `Pays actuel : ${initialValues.country.name}`}
            </label>
            <select id="country" {...form.register("country")} className="text-noir-900 w-52 h-10 rounded-md" defaultValue={initialValues.country} >
                <option value="">{!initialValues.country ? "-- Sélectionnez un pays --" : "Changer de pays"}</option> 
              {countries.map((country) => (
                <option key={country.id} value={country.id}>
                  {country.name}
                </option>
              ))}
            </select>
          </div>

          <div>
          
          </div>

          <div>
            <label className="text-white text-sm" htmlFor="stock">
              Stock
            </label>
            <Input
              id="stock"
              type="number"
              className="text-noir-900"
              defaultValue={initialValues.stock}
              {...form.register("stock", { valueAsNumber: true })}
            />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-white text-sm" htmlFor="description">
            Description
          </label>
          <textarea
            id="description"
            placeholder="Description du téléphone"
            className="text-noir-900 text-sm rounded-md p-2 h-32"
            defaultValue={initialValues.description}
            {...form.register("description")}
          />
        </div>

        {/* Upload des Images */}
        <div className="flex gap-4 items-center flex-wrap font-font1">
          <label className="text-white text-sm" htmlFor="images">
            {type === "add" ? "Ajouter les images" : "Rajouter des images"}
          </label>
          <input
            id="images"
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => {
              const files = e.target.files;
              if (files) {
                setSelectedFiles(Array.from(files));
              }
            }}
            className="text-noir-900 text-xs rounded-md"
          />
          <div className="flex gap-1">
            <div className="flex gap-1">
              {selectedFiles.map((file) => (
                <div key={file.name} className="flex items-center gap-2 ">
                  <Image
                    src={URL.createObjectURL(file)}
                    alt={file.name}
                    className="w-16 h-16 object-cover"
                    width={64}
                    height={64}
                  />

                  <button
                    type="button"
                    onClick={() => handleRemoveSelectedFile(file.name)}
                    className="text-red-500 text-xs"
                  >
                    Supp
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Afficher les images existantes */}
          {type === "edit" && (
            <div className="flex gap-1">
              {existingImages.map((url) => (
                <div key={url} className="flex items-center gap-2">
                  <Image
                    src={url}
                    alt="Image existante"
                    className="w-16 h-16 object-cover"
                    width={64}
                    height={64}
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveExistingImage(url)}
                    className="text-red-500 text-xs"
                  >
                    Supp
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <FormError message={error} />
        <FormSuccess message={success} />

        <button
          className="bg-gradient-to-br relative group/btn from-black dark:from-zinc-900 dark:to-zinc-900 to-neutral-600 block dark:bg-zinc-800 w-full text-white rounded-md h-10 font-medium shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:shadow-[0px_1px_0px_0px_var(--zinc-800)_inset,0px_-1px_0px_0px_var(--zinc-800)_inset]"
          type="submit"
        >
          {type === "add" ? "Ajouter la variante →" : "Modifier la variante →"}
          <BottomGradient />
        </button>
      </form>
    </div>
  );
}
