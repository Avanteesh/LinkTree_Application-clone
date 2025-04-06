import {useState, useEffect} from 'react';

function TextEditor(props)  {
  const [linktreename, setLinkTreeName] = useState("");
  const [editMode, setEditMode] = useState(true);
  function editHandler()  {
    if ((!editMode) && props.linktreeid !== null)  {
      if (window.confirm("Are you sure you want to change the name!"))  {
        fetch(`http://127.0.0.1:8000/api/updatelinktree?tree_id=${props.linktreeid}&newname=${linktreename}`,{
          method: 'PUT', headers: {'Content-Type': 'application/json'}
        }).then(
          (res) => res.json()
        ).then((result) => {
          if (result.status === 'success')  {
            window.location.reload();
            return;
          }
          window.alert("Ooops! try again!");
        });
      }
    }
    setEditMode(!editMode);
  }
  useEffect(() => {
    if (linktreename === "")  
      setLinkTreeName(props.linkTreeName);
  },[linktreename]);
  return (
    <div className="input-group mb-3">
      <div className="input-group-prepend" onClick={editHandler} 
        onMouseOver={(evt) => evt.target.style.cursor = 'pointer'}
        onMouseOut={(evt) => evt.target.style.cursor = 'default'}>
        <span className="input-group-text" id="basic-addon1">
          {(editMode)? (<i>&#x2705;</i>): 'linktree'}
        </span>
      </div>
      <input type="text" className="form-control" placeholder="enter linktree name..." value={linktreename} 
        onChange={(evt) => setLinkTreeName(evt.target.value)} disabled={editMode} />
    </div>
  );
}

function DisplayLinks(props)  {
  const [newLink, setNewLink] = useState({name: '', url: ''});
  const [urlIsValid, setIsValidURL] = useState(0);
  function urlInputHandler(evt)  {
    const copied = Object.assign({}, newLink);
    setNewLink({name: copied.name, url: evt.target.value});
    try {
      if (evt.target.value === "")  {
        setIsValidURL(0);
        return;
      }
      const url = new URL(evt.target.value);
      setIsValidURL(true);
    } catch(e)  {
      setIsValidURL(false);
    }
  }
  function deleteLinkWithId(evt)  {
    if (!window.confirm("Are you sure you want to delete this link?")) 
      return;
    fetch(`http://127.0.0.1:8000/api/removelink?linktree_id=${props.linkTreeDetail.linktree_id}&linkid=${evt.target.id}`, {
      method: 'DELETE', headers: {'Content-Type':'application/json'}
    }).then(
      (res) => res.json()
    ).then((result) => {
      if (result.status === 'success')  {
        window.location.reload();
        return;
      }
      window.alert("Oops! something went wrong!");
    });
  }
  const LinkElements = () => {
    const LINKBOX_COLORS = Object.freeze([
      "card border-info w-75", "card border-success w-75", 
      "card border-danger w-75", "card border-warning w-75",
      "card border-primary w-75", "card border-secondary w-75"
    ]);
    if (props.linkElements.length === 0)  {
      return (
        <div className="card-w-75">
          <p className="fw-lighter">Nothing here.</p>  
        </div>
      );
    }
    return (
      <>
        {props.linkElements.map(({id, link_id, linktext,url}, i) => {
          return (
            <div className={LINKBOX_COLORS[i % LINKBOX_COLORS.length]} key={i} style={{margin: '.3em'}}>
              <div className="card-body">
                <h5 className="card-title">{linktext}</h5>  
                <div className="input-group mb-3">
                  <span className="input-group-text" id="basic-addon1">&#128279;</span>
                  <input type="text" className="form-control" placeholder="Username" aria-label="Username" value={url} aria-describedby="basic-addon1" readOnly={true}/>
                </div>
                <button className="btn btn-outline-danger" id={id} onClick={deleteLinkWithId}>&#128465;</button>
              </div>  
            </div>
          );
        })}
      </>
    );
  }
  function addNewLinkToLinkTree(evt)  {
    evt.preventDefault();
    if (urlIsValid === 0 || urlIsValid === false || newLink.name === '')  {
      window.alert("First enter a valid url!");
      return;
    }
    fetch(`http://127.0.0.1:8000/api/addnewlink?linktree_id=${props.linkTreeDetail.linktree_id}&name=${newLink.name}&url=${newLink.url}`,{
      method: 'PUT', headers: {'Content-Type': 'application/json'}
    }).then(
      (response) => response.json()
    ).then((result) => {
      if (result.status === 'success')  {
        window.alert("saved successfully!");
        setTimeout(() => {
          window.location.reload();
        }, 900);
        return;
      }
      window.alert("Oops! something went wrong!");
    });
  }
  return (
    <>
      <div className="card w-75">
        <div className="card-body">
          <div className="col-md-13">
            <input type="text" style={{fontWeight: 'bold'}} value={newLink.name} placeholder="enter name..." 
              className="form-control" id="url-name-input-box" onChange={(evt) => {
                const copied = Object.assign({}, newLink);
                setNewLink({name: evt.target.value, url: copied.url})
              }} />
          </div>
          <div className="col-md-13">
            <input type="text" style={{color: '#2b8cd6'}} className={(urlIsValid === 0)? "form-control":(urlIsValid)? 'form-control is-valid': 'form-control is-invalid'} 
              id="validationServer01" value={newLink.url} required={true} placeholder="enter a link..." onChange={urlInputHandler} />
            {(urlIsValid === 0)? (''):(urlIsValid === true)? (<div className="valid-feedback">Looks good!</div>)
            :(<div className="invalid-feedback">not a valid url</div>)}
          </div>
          <button className="btn btn-outline-success" onClick={addNewLinkToLinkTree}>Add new link</button>
        </div>
      </div>
      <div className="col" style={{padding: '.1em'}}>
        <hr /> 
      </div>
      <LinkElements />
    </>
  );
}

export default function Profile()  {
  const [urlData, setURLData] = useState(null);
  const [currentPage, setCurrentPage] = useState("Links");
  useEffect(() => {
    if (urlData === null)  {
      const token = document.cookie.split(";").at(-1).split("=").at(-1);
      fetch(`http://127.0.0.1:8000/api/user/links?token=${token}`).then((response) => {
        if (!response.ok) return null;
        return response.json();
      }).then((get_data) => {
        setURLData(get_data.data);
      });
    }
    return () => { return; }
  }, [urlData, currentPage]);
  const mouseHoverHandler = (evt) => {
    evt.target.style.cursor = "pointer";
  }
  const mouseOutHandler = (evt) => {
    evt.target.style.cursor = "default";
  }
  return (
    <div className="grid" style={{'--bs-columns': '10', '--bs-gap': '1rem'}}>
      <div className="g-col-6">
        <ul className="nav nav-tabs">
          <li className="nav-item" onClick={() => setCurrentPage("Links")} 
            onMouseOver={mouseHoverHandler} onMouseOut={mouseOutHandler}>
            <a className={(currentPage === "Links")? "nav-link active":"nav-link"}>Links</a>
          </li>
          <li className="nav-item" onClick={() => setCurrentPage("Appearance")}
            onMouseOver={mouseHoverHandler} onMouseOut={mouseOutHandler}>
            <a className={(currentPage === "Appearance")? "nav-link active":"nav-link"}>Appearance</a>
          </li>
          <li className="nav-item" onClick={() => setCurrentPage("Analytics")}
            onMouseOver={mouseHoverHandler} onMouseOut={mouseOutHandler}>
            <a className={(currentPage === "Analytics")? "nav-link active":"nav-link"}>Analytics</a>
          </li>
        </ul>
      </div>
      <div className="row">
        <div className="col d-grid" style={{gridTemplateColumns: 'repeat(1,1fr)', padding: '1em',placeItems:'center',overflow: 'hidden, scroll'}}>
          {(currentPage === "Links")? (<DisplayLinks linkElements={(urlData === null)?[]:urlData.links} 
            linkTreeDetail={(urlData === null)?null:urlData.details} />)
          :(<h1>hi!</h1>)}
        </div>
        <div className="col" style={{padding: '1em'}}>
          {(urlData === null)? (<p aria-hidden="true">
              <span className="placeholder col-6"></span>
            </p>):(<TextEditor linkTreeName={urlData.details.linktreename} 
              linktreeid={urlData.details.linktree_id}/>)}
          <iframe></iframe>
        </div>
      </div>
    </div>
  );
}

