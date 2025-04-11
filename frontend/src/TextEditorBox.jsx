import {useState,useEffect} from 'react';

export default function TextEditor(props)  {
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

