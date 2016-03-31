import ko from 'knockout';

export var vmState = ko.observable('');
export var compileStatus = ko.observable('');

export var gccOptions = ko.observable('');
export var programArgs = ko.observable('');

export var focusTerm = ko.observable((tty) => {});
export var runCode = ko.observable((gccOptions) => {});

export var githubUsername = ko.observable('');
export var githubPassword = ko.observable('');
export var githubRepo = ko.observable('');

export var buildCmd = ko.observable('');
export var execCmd = ko.observable('');
export var lastGccOutput = ko.observable('');
export var gccOptsError =  ko.observable('');
export var gccErrorCount = ko.observable(0);
export var gccWarningCount = ko.observable(0);
export var editorAnnotations = ko.observableArray([]);
export var currentFileName = ko.observable('untitled');
export var currentFilePath = ko.observable('');
export var compileBtnEnable = ko.observable('');


export var projectLicense = ko.observable('');



//TODO work around so there is access to Editor from FileBrowser
export var Editor = {};