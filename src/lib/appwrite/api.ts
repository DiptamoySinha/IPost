import { ID, Query } from "appwrite";

import { INewPost, INewUser, IUpdatePost } from "../../../types";
import { account, appwriteConfig, avatars, databases, storage } from "./config";
import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "../react-query/queryKeys";

export async function createUserAccount(user: INewUser) {
  try {
    const newAccount = await account.create(
      ID.unique(),
      user.email,
      user.password,
      user.name
    );

    if (!newAccount) throw Error;

    const avatarUrl = await avatars.getInitials(user.name);

    const newUser = await saveUserToDb({
      accountId: newAccount.$id,
      name: newAccount.name,
      email: newAccount.email,
      username: user.username,
      imageUrl: avatarUrl,
    });

    console.log("saved user to db...");

    return newUser;
  } catch (error) {
    console.log(error);
    return error;
  }
}

export async function saveUserToDb(user: {
  accountId: string;
  email: string;
  name: string;
  imageUrl: URL;
  username?: string;
}) {
  try {
    const newUser = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      ID.unique(),
      user
    );
    return newUser;
  } catch (error) {
    console.log(error);
  }
}

export async function signInAccount(user: { email: string; password: string }) {
  try {
    const session = await account.createEmailSession(user.email, user.password);
    return session;
  } catch (error) {
    console.log(error);
  }
}

// ============================== GET ACCOUNT
export async function getAccount() {
  try {
    const currentAccount = await account.get();

    return currentAccount;
  } catch (error) {
    console.log(error);
  }
}

export async function getCurrentUser() {
  try {
    const currentAccount = await getAccount();
    if (!currentAccount) throw Error;

    // console.log([Query.equal("accountId", currentAccount.$id)])
    const currentUser = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      [Query.equal("accountId", currentAccount.$id)]
    );

    if (!currentUser) throw Error;

    return currentUser.documents[0];
  } catch (error) {
    console.log(error);
  }
}

export async function signOutAccount() {
  try {
    const session = await account.deleteSession("current");
    return session;
  } catch (error) {
    console.log(error);
  }
}

export async function createPost(post: INewPost) {
  try {
    // upload image to file:
    const uploadedFile = await uploadFile(post.file[0]);

    if (!uploadedFile) throw Error;

    const fileUrl = await getFilePreview(uploadedFile.$id);
    if (!fileUrl) {
      await deleteFile(uploadedFile.$id);
      throw Error;
    }

    // Convert tags into array
    const tags = post.tags?.replace(/ /g, "").split(",") || [];

    // Create post
    const newPost = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      ID.unique(),
      {
        creator: post.userId,
        caption: post.caption,
        imageUrl: fileUrl,
        imageId: uploadedFile.$id,
        location: post.location,
        tags: tags,
      }
    );

    if (!newPost) {
      await deleteFile(uploadedFile.$id);
      throw Error;
    }

    return newPost;
  } catch (error) {
    console.log(error);
  }
}

export async function updatePost(post: IUpdatePost)
{
  const hasFileToUpdate = post.file.length > 1;

  try {

    let image = {
      imageUrl: post.imageUrl,
      imageId: post.imageId
    }

    if(hasFileToUpdate) {
       // upload image to file:
      const uploadedFile = await uploadFile(post.file[0]);
      if (!uploadedFile) throw Error;

    const fileUrl = await getFilePreview(uploadedFile.$id);
    if (!fileUrl) {
      await deleteFile(uploadedFile.$id);
      throw Error;
    }

    image = {...image, imageId: uploadedFile.$id, imageUrl: fileUrl}
  }

    // Convert tags into array
    const tags = post.tags?.replace(/ /g, "").split(",") || [];

    // Create post
    const updatedPost = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      post.postId,
      {
        caption: post.caption,
        imageUrl: image.imageUrl,
        imageId: image.imageId,
        location: post.location,
        tags: tags,
      }
    );

    if (!updatedPost) {
      await deleteFile(post.imageId);
      throw Error;
    }

    return updatedPost;
  } catch (error) {
    console.log(error);
  }
}

export async function deletePost(postId: string, imageId: string) {
  if(!postId || !imageId) throw Error;

  try {
    await databases.deleteDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      postId
    )

    return {status: 'OK'}
  } catch (error) {
    console.log(error);
  }
}

export async function uploadFile(file: File) {
  try {
    const uploadedFile = await storage.createFile(
      appwriteConfig.storageId,
      ID.unique(),
      file
    );

    return uploadedFile;
  } catch (error) {
    console.log(error);
  }
}

export async function getFilePreview(id: string) {
  try {
    const fileUrl = storage.getFilePreview(
      appwriteConfig.storageId,
      id,
      2000,
      2000,
      "top",
      100
    );
    return fileUrl;
  } catch (error) {
    console.log(error);
  }
}

// ============================== DELETE FILE
export async function deleteFile(fileId: string) {
  try {
    await storage.deleteFile(appwriteConfig.storageId, fileId);

    return { status: "ok" };
  } catch (error) {
    console.log(error);
  }
}

export async function getRecentPosts() {
    try {
      const posts = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.postCollectionId,
        [Query.orderDesc("$createdAt"), Query.limit(20)]
      );
  
      if (!posts) throw Error;
  
      return posts;
    } catch (error) {
      console.log(error);
    }
  }

export async function likePost(postId: string, likesArray: string[])
{
  try {
     const updateDocument = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      postId,
      {likes: likesArray}
     )
     if(!updateDocument) throw Error

     return updateDocument;
  } catch (error) {
    console.log(error);
  }
}


export async function savePost(postId: string, userId: string)
{
  try {
     const updatedPost = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.savesCollectionId,
      ID.unique(),
      {
        user: userId,
        post: postId,
      }
     )
     if(!updatedPost) throw Error

     return updatedPost;
  } catch (error) {
    console.log(error);
  }
}


export async function deleteSavePost(saveId: string)
{
  try {
     const statusCode = await databases.deleteDocument(
      appwriteConfig.databaseId,
      appwriteConfig.savesCollectionId,
      saveId
     )
     if(!statusCode) throw Error

     console.log("deleted");
     return {status: 'OK'};
  } catch (error) {
    console.log(error);
  }
}

export async function getPostById(postId: string)
{
  try {
    const post = await databases.getDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      postId
    )

    if(!post) throw Error;

    return post
  } catch (error) {
    console.log(error);
  }
}