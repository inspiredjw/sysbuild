/* global Buffer */
import BrowserFS from 'browserfs';

// Encapsulates the virtual machine interface
class SysFileSystem {

    constructor() {
        this.initialized = false;
        return this;
    }

    initialize(sysRuntime)
    {
        this.initialized = true;
        BrowserFS.install(window);
        BrowserFS.initialize(new BrowserFS.FileSystem.LocalStorage());

        this.localFS = require('fs');
        this.jor1kFS = sysRuntime.jor1kgui.fs;
        this.listeners = [];

        //if the file system is empty load program.c
        if(this.getDirectoryChildren('/').length == 0)
        {
            this.localFS.writeFileSync('/program.c',
                '/*Write your C code here*/\n' +
                '#include <stdio.h>\n' +
                '\n' +
                'int main() {\n' +
                '    printf("Hello world!\\n");\n' +
                '    return 0;\n' +
                '}\n');
        }

        this.syncVM();

        this.jor1kFS.WatchDirectory('home/user', this.Jor1kNotifyCallBack.bind(this), this);

    }
/*------------------------------------------------------------------------------------------------*/
    /**
    *   API for interating with the joined file system
    **/

    writeFile(path, buf){
        if(path.charAt(0)!='/')
            path = '/' + path;

        if (typeof buf == 'string') buf = new Buffer(buf);

        this.jor1kFS.MergeBinaryFile('home/user'+path, new Uint8Array(buf.toArrayBuffer()));
        this.localFS.writeFileSync(path, buf);
    }

    readFile(path, cb){
        if(this.localFS.statSync(path).isDirectory())
            return;

        this.localFS.readFile(path, cb);
    }

    /*
    *   This is a blocking call, user readFile for asyc.
    */
    readFileSync(path){
        if(this.localFS.statSync(path).isDirectory())
            return;

        return this.localFS.readFileSync(path);
    }

    deleteFile(path){
        if(this.localFS.statSync(path).isDirectory())
            return;

        if(path.charAt(0)!='/')
            path = '/' + path;

        if(this.localFS.statSync(path).isFile())
            this.jor1kFS.DeleteNode('home/user'+path);
    }

    /*
    * Creates a directory.
    * Does not overwrite existing directories.
    */
    makeDirectory(path){
        if(path.charAt(0)!='/')
            path = '/' + path;

        this.jor1kFS.CreateDirectory('home/user'+path);
    }

    /*
    * Recursively removes a directory.
    */
    removeDirectory(path){
        if(this.localFS.statSync(path).isFile())
            return;

        if(path.charAt(0)!='/')
            path = '/' + path;

        if(this.localFS.statSync(path).isDirectory())
            this.jor1kFS.DeleteNode('home/user'+path);
    }

    /*
    * Renames a file or directory from oldpath to newpath.
    * Same functionality as mv.
    */
    rename(oldpath, newpath){
        if(oldpath==newpath)
            return;

        if(oldpath.charAt(0)!='/')
            oldpath = '/' + oldpath;

        if(newpath.charAt(0)!='/')
            newpath = '/' + newpath;

        if(this.localFS.existsSync(oldpath))
            this.jor1kFS.Rename('home/user'+oldpath, 'home/user'+newpath);
    }

    /*
    * Copies a single file from srcpath to dstpath.
    * Copying of directories is not yet implemented.
    */
    copyTo(srcpath, dstpath){
        if(srcpath == dstpath)
            return;

        var stat = this.localFS.statSync(srcpath);
        if(stat.isDirectory())
            return;

        this.localFS.readFile(srcpath, function(err, buf){
            if(dstpath.charAt(0)!='/')
                dstpath = '/' + dstpath;

            this.jor1kFS.MergeBinaryFile('home/user'+dstpath, new Uint8Array(buf.toArrayBuffer()), stat.mode);

        }.bind(this));
    }

    /*
    * Returns an array of { isDirectory: boolean, name: string } objects
    * of all nodes with in the directory specified in path.
    */
    getDirectoryChildren(path){
        if(path == '')
            path = '/';

        if((!this.localFS.existsSync(path)) || this.localFS.statSync(path).isFile())
            return [];

        var children = this.localFS.readdirSync(path);
        var ret = [];

        if(path.charAt(path.length-1)!='/')
            path = path + '/';

        for(var i=0; i<children.length; i++)
        {
            var child = {};
            child.name = children[i];

            if(this.localFS.statSync(path+children[i]).isDirectory())
                child.isDirectory = true;
            else
                child.isDirectory = false;
            if(!(child.name.indexOf('.') == 0))
                ret.push(child);
        }
        return ret;
    }

    /*
    * Returns an array of { isDirectory: boolean, path: string } objects
    * of all nodes within /home/user. Partially ordered from root -> leafs
    */
    getDirectoryTree(){
        return this.getDirectoryTreeHelper('/');
    }

    /*
    * Helper for getDirectoryTree
    */
    getDirectoryTreeHelper(path){
        var children = this.localFS.readdirSync(path);

        if(path=='/')
            path = '';

        var ret = [];
        var dirs = [];
        for(var i=0; i<children.length; i++)
        {
            var childPath = path+'/'+children[i];
            var child = {};
            child.path = childPath;

            if(this.localFS.statSync(childPath).isDirectory())
            {
                child.isDirectory = true;
                dirs.push(childPath);
            }
            else
                child.isDirectory = false;

            ret.push(child);
        }

        for(var a=0; a<dirs.length; a++)
        {
            ret.push.apply(ret, this.getDirectoryTreeHelper(dirs[a]));
        }

        return ret;

    }

    addChangeListener(fn){
        var ary = this.listeners;
        if (ary) {
            ary.push(fn);
        } else {
            this.listeners = [fn];
        }
    }

    removeChangeListener(fn) {
        var ary = this.listeners;
        this.listeners = ary.filter(function (el) {
            return el !== fn;
        });
    }

    notifyChangeListeners() {
        var ary = this.listeners;
        if (!ary) {
            return;
        }
        ary = ary.slice(); // Listeners may be added/removed during this event, so make a copy first
        for (var i = 0; ary && i < ary.length; i++) {
            ary[i]();
        }
    }

/*------------------------------------------------------------------------------------------------*/
    /**
    *   Write all local files (those stored in local storage) to
    *   the Jor1k file system (i.e /home/user)
    **/
    syncVM() {

        console.log('Starting Syncing VM File System');
        this.jor1kFS.DeleteDirContents('home/user');
        this.syncDirectory('/');
        console.log('Done Syncing');
    }

    syncDirectory(directory) {
        if(directory != '/')
            this.jor1kFS.CreateDirectory('home/user'+directory);

        var children = this.localFS.readdirSync(directory);
        if(directory == '/')
            directory = '';
        for(var i = 0; i<children.length; i++){
            var newpath = directory+'/'+children[i];
            var stat = this.localFS.statSync(newpath);
            if(stat.isDirectory())
                this.syncDirectory(newpath);
            else
            {
                var buf = this.localFS.readFileSync(newpath);
                this.jor1kFS.MergeBinaryFile('home/user'+newpath, new Uint8Array(buf.toArrayBuffer()), 33261);
            }
        }
    }
/*------------------------------------------------------------------------------------------------*/
    /**
    *   Handeling callbacks from file operations done on
    *   the Jor1k VM
    **/
    Jor1kNotifyCallBack(info){
        var path = info.path.substring('home/user'.length, info.path.length);

        if(path=='') return;
        console.log(info.event);
        switch(info.event) {
            case 'write':
                this.jor1kFS.ReadFile(info.path, this.Jor1kReadCallBack.bind(this), this);
                break;
            case 'newdir':
                this.localFS.mkdir(path, function(err){if(err)console.log(err);});
                this.notifyChangeListeners();
                break;
            case 'newfile':
                this.jor1kFS.ReadFile(info.path, this.Jor1kReadCallBack.bind(this), this);
                this.notifyChangeListeners();
                break;
            case 'delete':
                if(this.localFS.statSync(path).isDirectory())
                    this.localFS.rmdir(path, function(err){if(err)console.log(err);});
                else
                    if(this.localFS.existsSync(path))
                        this.localFS.unlink(path, function(err){if(err)console.log(err);});
                this.notifyChangeListeners();
                break;
            case 'rename':
                if (info.info!={}){
                    var oldpath = info.info.oldpath.substring('home/user'.length, info.info.oldpath.length);
                    this.localFS.rename(oldpath, path);
                    this.notifyChangeListeners();
                }
        }
    }

    Jor1kReadCallBack(file){
        var filename = file.name.substring('home/user'.length, file.name.length);

        console.log('Writting to local: ' + filename);
        var buf = new Buffer(file.data);
        this.localFS.writeFileSync(filename, buf, {mode:file.mode});

    }


}

// SysFileSystem is meant to be used as a singleton
export default (new SysFileSystem());