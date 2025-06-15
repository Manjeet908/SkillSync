import React,{useState,useEffect} from 'react'
import axios from 'axios'
import './YourPost.css'

function YourPost() {
    const [posts,setPosts] = useState([])
    const [loading,setLoading] = useState(true)
    const [error,setError] = useState(null)

    useEffect(()=>{
        const fetchPosts = async()=>{
            try{
                const res=await axios.get('/posts/YourPost')
                setPosts(res.data)
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
                        <div key={post._id} className="your-post-card">
                            <h3 className="post-title">{post.title}</h3>
                            {
                                post.mediaType === 'image' ? (
                                    <img 
                                        src={post.mediaUrl} 
                                        alt={post.title} 
                                        className="post-media"
                                    />
                                ) : (
                                    <video 
                                        controls 
                                        className="post-media"
                                    >
                                        <source src={post.mediaUrl} type="video/mp4" />
                                        Your browser does not support the video tag.
                                    </video>
                                )
                            }
                            <small className="post-date">Posted on: {new Date(post.createdAt).toLocaleString()}</small>
                            <p className="post-description">{post.description}</p>
                            <div className="post-actions">
                                <button className="edit-button">Edit</button>
                                <button className="delete-button">Delete</button>
                            </div>
                        </div>
                    ))
                )
            }
        </div>
    )
}

export default YourPost