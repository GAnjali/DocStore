import React, {Component} from "react";
import Header from "./Header";
import './Home.css';
import Sidebar from "./Sidebar";
import {
    deleteFile,
    getFileByid,
    getFiles,
    getFolders,
    updateFile,
    getUserByEmail,
    addShare,
    addFile, addFolder,
    deleteFolder
} from "./HomeService";
import MainSection from "./MainSection";
import {isLoggedIn} from "../../Util/AuthService";
import FileModel from "../File/FileModel";
import ShareModel from "./ShareModel";
import FolderModel from "../Folder/FolderModel";

class Home extends Component {

    state = {
        folders: [],
        files: [],
        error: '',
        editingFile: null,
        showFileModel: false,
        showSharingModel: false,
        showFolderModel: false,
        sharingFile: null,
        sharingWith: null,
        shareType: 'View',
        newFile: false,
        newFolder: ''
    };

    componentDidMount() {
        if (!isLoggedIn()) {
            this.props.history.replace('/login')
        } else {
            localStorage.setItem("parentfolderid", 0);
            this.updateComponent(0);
        }
    }

    getAllFiles = async (parentfolderid) => {
        const getFilesResponse = await getFiles(parentfolderid);
        if (getFilesResponse.data.status == 'success') {
            if (getFilesResponse.data.data != undefined) {
                this.setState({
                    files: getFilesResponse.data.data
                });
            } else {
                this.setState({
                    files: []
                });
            }
        }
        //get shared files
    };
    fetchFolders = async (parentFolderId) => {
        const docsResponse = await getFolders(parentFolderId);
        if (docsResponse.status == 200) {
            if (docsResponse.data.status == 'success') {
                if (docsResponse.data.data !== undefined) {
                    this.setState({
                        folders: docsResponse.data.data
                    });
                } else {
                    this.setState({
                        folders: []
                    });
                }
            }
        } else {
            this.setError(docsResponse.message);
        }
    };

    setError = (errorMessage) => {
        this.setState({
            error: errorMessage
        })
    };

    handleFileClick = async (event) => {
        if (event.target.id != undefined) {
            if (event.target.className === "file-content") {
                const response = await getFileByid(this.state.files[event.target.id].id);
                if (response.status === 200 && response.data.data !== undefined) {
                    this.setState({
                        editingFile: response.data.data,
                        showFileModel: true
                    })
                }
            } else if (event.target.className === "file-delete") {
                const deleteResponse = await deleteFile(this.state.files[event.target.id].id);
                if (deleteResponse.status === 200) {
                    this.updateComponent(localStorage.getItem("parentfolderid"));
                }
            } else if (event.target.className === "file-share") {
                console.log(event.target.id);
                this.setState({
                    showSharingModel: true,
                    sharingFile: this.state.files[event.target.id]
                })
            }
        }
    };

    handleFolderClick = async (event) => {
        console.log(event.target.className);
        console.log(event.target.id);
        if (event.target.className == 'folder-delete') {
            const deleteFolderResponse = await deleteFolder(this.state.folders[event.target.id].id);
            console.log(deleteFolderResponse);
            if (deleteFolderResponse.status == 200) {
                this.updateComponent(localStorage.getItem("parentfolderid"));
            } else {
                this.setState({
                    error: deleteFolderResponse.message
                })
            }
        } else if (event.target.className !== 'folder-share') {
            console.log("in handle folder click");
            //set parentfolder
            localStorage.setItem("parentfolderid", this.state.folders[event.target.id].id);
            localStorage.setItem("parentfoldername", this.state.folders[event.target.id].name);
            this.updateComponent(this.state.folders[event.target.id].id);
        }
    };

    handleContentChange = (e) => {
        const newContent = e.target.value;
        this.setState((prevState) => {
            const fileOnEdit = prevState.editingFile;
            fileOnEdit.content = newContent;
            return {editingFile: fileOnEdit};
        });
    };

    handleTitleChange = (e) => {
        const newTitle = e.target.value;
        this.setState((prevState) => {
            const fileOnEdit = prevState.editingFile;
            fileOnEdit.name = newTitle;
            return {editingFile: fileOnEdit};
        });
    };

    handleSaveFile = async () => {
        if (this.state.showFileModel) {
            if (!this.state.newFile) {
                await updateFile(this.state.editingFile).then(() => {
                    this.setState({
                        showFileModel: false,
                    });
                    this.updateComponent(localStorage.getItem("parentfolderid"));
                });
            }
            await addFile(this.state.editingFile).then(() => {
                this.setState({
                    showFileModel: false,
                    newFile: false
                }, () => {
                    this.updateComponent(localStorage.getItem("parentfolderid"));
                });
            });
        }
    };

    updateComponent = (parentfolderid) => {
        this.fetchFolders(parentfolderid);
        this.getAllFiles(parentfolderid);
    };

    handleSaveFolder = async () => {
        const newFolder = {name: this.state.newFolder};
        await addFolder(newFolder).then(() => {
            this.setState({
                showFolderModel: false
            });
            this.updateComponent(localStorage.getItem("parentfolderid"));
        })
    };

    handleFolderNameChange = (event) => {
        this.setState({
            newFolder: event.target.value
        })
    };

    handleClose = () => {
        this.setState({
            showFileModel: false,
            showFolderModel: false
        });
    };

    handleInput = (event) => {
        this.setState({
            sharingWith: event.target.value
        })
    };

    handleShareType = (event) => {
        this.setState({
            shareType: event.target.id
        })
    };

    handleShare = async () => {
        const getUserResponse = await getUserByEmail(this.state.sharingWith);
        if (getUserResponse.status == 200) {
            const shareResponse = await addShare(this.state.sharingFile.id, this.state.shareType, getUserResponse.data.data.id);
            if (shareResponse.status == 200) {
                alert(shareResponse.data.message);
            } else {
                this.setState({
                    error: getUserResponse.message
                })
            }
        } else {
            this.setState({
                error: getUserResponse.message
            })
        }
    };

    handleAddFile = () => {
        const newFile = {
            name: '',
            content: '',
            parentfoldername: localStorage.getItem("parentfoldername")
        };
        this.setState({
            showFileModel: true,
            editingFile: newFile,
            newFile: true
        })
    };


    handleAddFolder = () => {
        this.setState({
            showFolderModel: true
        })
    };

    render() {
        return (
            <>
                <Header/>
                <Sidebar handleAddFile={this.handleAddFile} handleAddFolder={this.handleAddFolder}/>
                <MainSection folders={this.state.folders} files={this.state.files}
                             handleFileClick={this.handleFileClick} handleFolderClick={this.handleFolderClick}/>
                <FolderModel show={this.state.showFolderModel} newFolder={this.state.newFolder}
                             handleFolderNameChange={this.handleFolderNameChange}
                             handleSaveFolder={this.handleSaveFolder} handleClose={this.handleClose}/>
                <FileModel editingFile={this.state.editingFile} show={this.state.showFileModel}
                           handleTitleChange={this.handleTitleChange}
                           handleContentChange={this.handleContentChange} handleSaveFile={this.handleSaveFile}
                           handleClose={this.handleClose}/>
                <ShareModel show={this.state.showSharingModel} sharingFile={this.state.sharingFile}
                            handleInput={this.handleInput} handleShareType={this.handleShareType}
                            handleShare={this.handleShare}/>
            </>
        )
    }
}

export default Home;