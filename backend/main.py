from fastapi import FastAPI, Request, Response
from fastapi import status, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from fastapi.middleware.cors import CORSMiddleware
from jose import jwt, JWTError
from sqlmodel import SQLModel, Session, select, update, delete
from os import getenv
from datetime import datetime, timedelta
from dotenv import load_dotenv
from passlib.context import CryptContext
from json import loads
from models import User,LinkTree,LinkTreeURLS,dbengine

class UserMetaData(SQLModel):
    username: str | None = None
    email: str 
    bio: str | None = None
    password: str

load_dotenv()
app = FastAPI()
pwd_context = CryptContext(schemes=["bcrypt"],deprecated="auto")
oauth2scheme = OAuth2PasswordBearer(tokenUrl="token")

app.add_middleware(
 CORSMiddleware,
 allow_origins=["http://localhost:5173"],
 allow_credentials=True,
 allow_methods=["*"],
 allow_headers=["*"]
)

def authenticate(data: UserMetaData):
    query = None
    with Session(dbengine) as session:
        query = session.exec(select(User).where(User.email == data.email)).first()
    if query is not None:
        if pwd_context.verify(data.password, query.password) is False:
            return None
        return query

def createJWTtoken(data: dict):
    copied = {'sup': data.copy(), 'exp':  datetime.now() + timedelta(minutes=60)}
    encoded = jwt.encode(copied, getenv('SECRET_KEY'),algorithm='HS256')
    return encoded
    
@app.post("/api/signin")
async def signIn(request: Request, data: UserMetaData):
    userdata = authenticate(data)
    if userdata is not None:
        raise HTTPException(
          detail="Looks like your email or password is incorrect!",
          status_code=status.HTTP_401_UNAUTHORIZED,
          headers={'WWW-Authenticate': 'Bearer'}
        )
    jwt_token = None
    with Session(dbengine) as session:
        user_model = User(
          email=data.email,password=pwd_context.hash(data.password),username=data.username,
          bio=data.bio,profile_picture=None
        )
        linktree = LinkTree(
          user_id=user_model.user_id, background_image=None,background_color='#fff',
          linktreename=data.username,views=0
        )
        session.add(user_model)  # add user to database!
        session.add(linktree)   # create a link tree instance!
        session.commit()  
        jwt_token = createJWTtoken({'user_id': user_model.user_id, "email": user_model.email})
    return {"token": jwt_token}   # send token to client

@app.post("/api/loginuser")
async def loginUser(request: Request, data: UserMetaData):
    userdata = authenticate(data)
    if userdata is None:
        raise HTTPException(
          detail="This user doesn't exist!",
          status_code=status.HTTP_401_UNAUTHORIZED,
          headers={"WWW-Authenticate": "Bearer"}
        )
    jwt_token = createJWTtoken({'user_id': userdata.user_id, 'email': userdata.email})
    return {"token": jwt_token}  # send token to client

@app.get("/api/user")
async def getUserData(request: Request, token: str):
    try:
        decoded_jwt = jwt.decode(token, getenv('SECRET_KEY'), algorithms=["HS256"])
    except JWTError:
        return {'status': 'failed', 'message': 'Unauthorized!'}
    user_data = None
    with Session(dbengine) as session:
        user_data = session.exec(
          select(User.user_id, User.username, User.profile_picture, User.bio).where(
            User.user_id == decoded_jwt['sup']['user_id']
          )
        ).first()
    if user_data is None:
        return {'status': 'failed'}
    jsonified = dict(zip(('user_id', 'username', 'profile_picture', 'bio'), user_data))
    return {
      'status':'success','data': jsonified
    }

@app.get("/api/user/links")
async def getLinks(request: Request, token: str):
    user_data = None
    try:
        user_data = jwt.decode(token, getenv('SECRET_KEY'),algorithms=["HS256"])
    except JWTError:
        return {'status': 'failed', 'message': 'Unauthorized!'}
    ltree_details, linktree_links = None, None
    with Session(dbengine) as session:
        ltree_details = session.exec(
          select(LinkTree).where(
            LinkTree.user_id == user_data['sup']['user_id']
          )
        ).first()
        linktree_links = session.exec(
          select(LinkTreeURLS).where(
            LinkTreeURLS.link_id == ltree_details.linktree_id
          )
        ).fetchall()
    linktree_links = [dict(item) for item in linktree_links]
    return {
      'status': 'success', 'data': {
        'details': dict(ltree_details),'links': linktree_links
      }
    }

@app.get("/api/getlinktree")
async def getLinkTree(request: Request, username: str):
    linktree_details, links = None, None
    with Session(dbengine) as session:
        linktree_details = session.exec(
          select(User.username,User.profile_picture, User.bio,LinkTree.background_image,
            LinkTree.background_color,LinkTree.linktree_id).where(
            LinkTree.linktreename == username
          )
        ).first()
        if linktree_details is not None:
            linktree_links = session.exec(
              select(LinkTreeURLS.linktext, LinkTreeURLS.url).where(
                LinkTreeURLS.link_id == linktree_details[5]
              )
            ).fetchall()
    if linktree_details is None:
        return {'status': 'failed'}
    linktree_details = dict(zip(('username', 'profile_picture','bio','background_image','background_color'), linktree_details))
    linktree_links = [dict(zip(('linktext','url'), item)) for item in linktree_links]
    return {
      'status': 'success', 'data': {
        'details': linktree_details,'links': linktree_links
      }
    }

@app.put("/api/updatelinktree")
async def updateLinkTree(request: Request, tree_id: str, newname: str):
    with Session(dbengine) as session:
        session.exec(
          update(LinkTree).where(
            LinkTree.linktree_id == tree_id
          ).values(linktreename = newname)
        )
        session.commit()
    return {'status': 'success'}

@app.put("/api/addnewlink")
async def addNewLinkToLinkTree(request: Request, linktree_id: str, name: str, url: str):
    with Session(dbengine) as session:
        session.add(LinkTreeURLS(link_id=linktree_id,linktext=name,url=url))
        session.commit()
    return {'status': 'success'}

@app.delete("/api/removelink")
async def removeLinkFromLinkTree(request: Request, linktree_id: str, linkid: str):
    with Session(dbengine) as session:
        session.exec(delete(LinkTreeURLS).where(
          LinkTreeURLS.link_id == linktree_id
        ).where(LinkTreeURLS.id == linkid))
        session.commit()
    return {'status': 'success'}

@app.patch("/api/renamelinks")
async def renameLinkInLinkTree(request: Request, data: dict[str, str]):
    with Session(dbengine) as session:
        session.exec(update(LinkTreeURLS).where(
            LinkTreeURLS.id == data['l_id']
          ).values(linktext = data['LinkName']
          ).values(url=data['Url'])
        )
        session.commit()
    return {'status': 'success'}

@app.put("/api/updateView")
async def updateLinkTreeView(request: Request, linktree: str):
    with Session(dbengine) as session:
        session.exec(
          update(LinkTree).where(
            LinkTree.linktreename == linktree
          ).values(views = LinkTree.views + 1)
        )
        session.commit()
    return {'status': 'success'}
