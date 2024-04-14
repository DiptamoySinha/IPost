import {PostCard, Loader} from '@/components/shared';
import { getRecentPosts } from '@/lib/appwrite/api';
import { client } from '@/lib/react-query/QueryProvider';
import { useGetRecentPosts } from '@/lib/react-query/queriesAndMutation'
// import { QUERY_KEYS } from '@/lib/react-query/queryKeys';
import { Models } from 'appwrite';

export default function Home() {

  const {data: posts, isPending: isPostLoading, isError: isErrorPosts} = useGetRecentPosts()
  // console.log(isRefetching)
  console.log('postFetched: ' + posts?.documents.length)

  if (isErrorPosts) {
    return (
      <div className="flex flex-1">
        <div className="home-container">
          <p className="body-medium text-light-1">Something bad happened</p>
        </div>
        <div className="home-creators">
          <p className="body-medium text-light-1">Something bad happened</p>
        </div>
      </div>
    );
  }
  return (
    <div className="flex flex-1">
      <div className="home-container">
        <div className="home-posts">
          <h2 className="h3-bold md:h2-bold text-left w-full">Home Feed</h2>
          {isPostLoading && !posts ? (
            <Loader />
          ) : (
            <ul className="flex flex-col flex-1 gap-9 w-full ">
              {posts?.documents.map((post: Models.Document) => (
                <li key={post.$id} className="flex justify-center w-full">
                  <PostCard post={post} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}

export function homeLoader() {
  console.log('calling home loader')
  return client.fetchQuery({
    queryKey: ['recentPost'],
    queryFn: getRecentPosts
})
}
