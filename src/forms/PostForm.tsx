import * as z from "zod";
import { Models } from "appwrite";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { PostValidation } from "@/lib/validation";
import { useToast } from "@/components/ui/use-toast";
import { useUserContext } from "@/context/AuthContext";
import { FileUploader, Loader } from "@/components/shared";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCreatePost } from "@/lib/react-query/queriesAndMutation";
// import { useCreatePost, useUpdatePost } from "@/lib/react-query/queries";

type PostFormProps = {
    post?: Models.Document;
    action: "Create" | "Update";
  };

export default function PostForm({ post, action }: PostFormProps) {
    const navigate = useNavigate();
    const {user} = useUserContext();
    const { toast } = useToast();

    const { mutateAsync: createPost, isPending: isLoadingCreate } = useCreatePost();

    const form = useForm<z.infer<typeof PostValidation>>({
        resolver: zodResolver(PostValidation),
        defaultValues: {
          caption: post ? post?.caption : "",
          file: [],
          location: post ? post.location : "",
          tags: post ? post.tags.join(",") : "",
        },
    });

    async function handleSubmit(value: z.infer<typeof PostValidation>){
        const newPost = await createPost({...value, userId: user.id})

        if(!newPost){
            toast({
                title: `${action} post failed. Please try again.`,
              });
        }

        navigate('/')
    }

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(handleSubmit)}
                className="flex flex-col gap-9 w-full  max-w-5xl">
                <FormField
                    control={form.control}
                    name="caption"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel className="shad-form_label">Caption</FormLabel>
                        <FormControl>
                            <Textarea
                            className="shad-textarea custom-scrollbar"
                            {...field}
                            />
                        </FormControl>
                        <FormMessage className="shad-form_message" />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="file"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel className="shad-form_label">Add Photos</FormLabel>
                        <FormControl>
                            <FileUploader
                                fieldChange={field.onChange}
                                mediaUrl={post?.imageUrl}
                            />
                        </FormControl>
                        <FormMessage className="shad-form_message" />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel className="shad-form_label">Add Location</FormLabel>
                        <FormControl>
                            <Input type="text" className="shad-input" {...field} />
                        </FormControl>
                        <FormMessage className="shad-form_message" />
                        </FormItem>
                    )}
                />  

                <FormField
                    control={form.control}
                    name="tags"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel className="shad-form_label">
                            Add Tags (separated by comma " , ")
                        </FormLabel>
                        <FormControl>
                            <Input
                            placeholder="JS, React, NextJS"
                            type="text"
                            className="shad-input"
                            {...field}
                            />
                        </FormControl>
                        <FormMessage className="shad-form_message" />
                        </FormItem>
                    )}
                />
                <div className="flex gap-4 items-center justify-end">
                    <Button
                        type="button"
                        className="shad-button_dark_4"
                        onClick={() => navigate(-1)}>
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        className="shad-button_primary whitespace-nowrap"
                        disabled={isLoadingCreate}>
                        {isLoadingCreate && <Loader />}
                        {action} Post
                    </Button>
                </div>
            </form>
        </Form>
    )
}
