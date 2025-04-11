import {useParams} from 'react-router-dom';
import {useState, useEffect} from 'react';

export default function UserLinkTree()  {
  const params = useParams();
  const [linkTree, setLinkTreeData] = useState(null);
  const [isviewed, setIsViewed] = useState(false);
  useEffect(() => {
    if (linkTree === null)  {
      fetch(`http://127.0.0.1:8000/api/getlinktree?username=${params.linktreename}`).then(
        (res) => res.json()
      ).then((result) => {
        if (result.status === 'failed') {
          window.location.href = '/';
          return;
        }
        setLinkTreeData(result.data);
      });
    } else {
      if (linkTree.details.background_color !== '') 
        document.body.style.backgroundColor = linkTree.details.background_color;
      else if (linkTree.details.background_image !== null) 
        document.body.style.background = linkTree.details.background_image;
    }
    if (!isviewed)  {
      setTimeout(() => {
        // if user stays in the page for 30 seconds it counts a view
        fetch(`http://127.0.0.1:8000/api/updateView?linktree=${params.linktreename}`,{
          method: 'PUT', headers: {'Content-Type': 'application/json'}
        }).then((res) => res.json()).then((item) => {
          setIsViewed(true);
        });
      }, 30000);
    }
    return () => { return; }
  }, [linkTree,isviewed]);
  /* using skeletons to display dynamic loading while fetching content!*/
  return (
    <div className="container d-grid" style={{placeItems:'center',height: '70vh'}}>
      <div>
        <div style={{textAlign:'center'}} id="profile-container" key={0}>
          {(linkTree === null)? 
            (<div className="image-loader-skeleton"></div>):
            (<img src={(linkTree.details.background_image === "")? '/profile-pic.png':linkTree.details.background_image} style={{borderRadius:'50%'}} 
              className="img-thumbnail" height="200"/>)}
        </div>
        <div style={{textAlign:'center'}} id="username-wrapper" key={1}>
          {(linkTree === null)? (<span className="placeholder col-7"></span>):
          (<h3 className="fw-bold">@{linkTree.details.username}</h3>)}
        </div>
        <div style={{textAlign:'center'}} id="user-bio-display" key={2}>
          {(linkTree === null)? (<span className="placeholder col-6"></span>):
          (<p className="fst-italic">{linkTree.details.bio}</p>)}
        </div>
        <div className="d-flex" style={{flexDirection: 'column',textAlign: 'center',gap:'.5em'}} id="display-links" key={3}>
          {(linkTree === null)? (<>
            <span className="placeholder col-6" key={0}></span>
            <span className="placeholder col-6" key={1}></span>
            <span className="placeholder col-6" key={2}></span>
            <span className="placeholder col-6" key={3}></span>
          </>):linkTree.links.map(({linktext, url}, i) => {
            return (
              <><a className="btn btn-primary" href={url} key={i}>{linktext}</a></>
            );
          })}
        </div>
      </div>
    </div>
  );
}
