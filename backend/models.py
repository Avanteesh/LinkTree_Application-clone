from sqlmodel import SQLModel, create_engine,Field,String,BLOB
from uuid import uuid4

dbengine = create_engine("sqlite:///links.db")

class User(SQLModel, table=True):
    user_id: str = Field(default=f"usr-{str(uuid4())}", primary_key=True)
    username: str = Field(String)
    profile_picture: bytes | None = Field(default=None, nullable=True)
    email: str = Field(String, unique=True)
    password: str = Field(String)
    bio: str = Field(String)

class LinkTree(SQLModel, table=True):
    user_id: str = Field(String, foreign_key="user.user_id")
    linktree_id: str = Field(default=f"linktre-{str(uuid4())}", primary_key=True)
    background_image: bytes = Field(default=None)
    background_color: str = Field(default=None)
    linktreename: str = Field(String, unique=True)
    views: int = Field(default=0)   # number of visits to the URL!

# Don't mind the class names, LOL!
class LinkTreeURLS(SQLModel, table=True):
    id: str = Field(default=f"link-{str(uuid4())}", primary_key=True)
    link_id: str = Field(String, foreign_key="linktree.linktree_id")
    linktext: str = Field(String)
    url: str = Field(String)

SQLModel.metadata.create_all(dbengine)

