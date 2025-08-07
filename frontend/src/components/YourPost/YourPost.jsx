import {useState,useEffect, useContext} from 'react'
import { AuthContext } from "../../context/AuthContext";
import Post from '../post/Post';
import axiosInstance from '../../api/axios'
import './YourPost.css'

function YourPost() {
    const [posts,setPosts] = useState([])
    const [loading,setLoading] = useState(true)
    const [error,setError] = useState(null)

    const { user } = useContext(AuthContext)

    useEffect(()=>{
        const fetchPosts = async()=>{
            try{
                const res=await axiosInstance.get(`/posts/get-user-posts/${user._id}`)
                if (!res.data || !Array.isArray(res.data.data)) {
                    console.error("Invalid response data:", res.data);
                    return;
                }

                setPosts(
                res.data.data.sort((p1, p2) => {
                    return new Date(p2.createdAt) - new Date(p1.createdAt);
                })
                );
                
                setLoading(false)
            }catch(err){
                setError(err)
                setLoading(false)
            }
        }
        fetchPosts()
        
    },[]);

    if (loading) return <div className="loading">Loading...</div>;
    if (error) return <div className="error">Error: {error.message}</div>;

    return (
        <div className="your-posts-container">
            <h2 className="your-posts-title">Your Posts</h2>
            {
                posts.length === 0 ? (
                    <p className="no-posts-message">You haven't posted anything yet.</p>
                ) : (
                    posts.map((post)=>(
                        <Post post={post} key={post._id}/>
                    ))
                )
            }
        </div>
    )
}

export default YourPost