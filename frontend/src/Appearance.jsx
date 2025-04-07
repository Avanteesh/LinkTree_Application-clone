import {useState,useEffect} from 'react';

export default function Appearance(props)  {
  const [colorSetDialog, statusColorDialog] = useState(false);
  const [linkTreeSettings, setLinkTreeSettings] = useState({
    background_color: 'no-color'
  });
  useEffect(() => {
    if (props.details !== null)  {
      if (linkTreeSettings.background_color === 'no-color') 
        setLinkTreeSettings({background_color: props.details.background_color});
    }
  }, [linkTreeSettings,colorSetDialog]);
  return (
    <div className="container">
      <div className="d-flex" style={{flexDirection: 'row',gap: '2em'}}>
        <label htmlFor="inputBio" className="col-sm-2 col-form-label">background color</label>
        <div className="col-sm-6">
          <button className="btn btn-primary" data-bs-target="#colorSetModal">set color</button>
        </div>
      </div>
      {/*
      <div className="modal fade" id="colorSetModal" aria-hidden="false">\
        <div className="modal-dialog" tabIndex="-1" style={{display: 'block'}}>
          <div className="modal-content">
            <div className="modal-header">
              <h1 className="modal-title fs-5" id="exampleModalLabel">Modal title</h1>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>  
          </div>  
        </div>
      </div>*/}
    </div>
  );
}
