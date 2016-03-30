import * as SysGlobalObservables from 'app/sys-global-observables';

class LiveEdit {
    constructor(_runtime) {
        this.runtime = _runtime;

        var updateCompileButton = () => {
            var ready = this.runtime.ready();
            SysGlobalObservables.vmState(ready ? 'Running' : 'Booting');
            SysGlobalObservables.compileStatus(ready ? 'Ready' : 'Waiting');
        };

        updateCompileButton(); // Maybe sys is already up and running

        this.runtime.addListener('ready', () => {
            updateCompileButton();
        });

        // Setup callbacks so that the UI can invoke functions on this class
        // as well as on the runtime.
        SysGlobalObservables.focusTerm(this.runtime.focusTerm.bind(this.runtime));
        SysGlobalObservables.runCode(this.runCode.bind(this));
    }

    escapeHtml(unsafe) {
        /*stackoverflow.com/questions/6234773/*/
        return unsafe
             .replace(/&/g, '&amp;')
             .replace(/</g, '&lt;')
             .replace(/>/g, '&gt;')
             .replace(/"/g, '&quot;')
             .replace(/'/g, '&#039;');
    }

    processGccCompletion(result) {
        SysGlobalObservables.gccErrorCount(0);
        SysGlobalObservables.gccWarningCount(0);

        if (!result) {
            // cancelled
            SysGlobalObservables.compileStatus('Cancelled');
            return;
        }

        // null if cancelled
        // result = { 'exitcode':gcc_exit_code, 'stats':stats,'annotations':annotations,'gcc_ouput':gcc_output}

        this.runtime.sendKeys('tty0', 'clear\n');

        var aceAnnotations = [], buildCmdErrors = [];
        result.annotations.forEach((annotation) => {
            if (annotation.isBuildCmdError) {
                buildCmdErrors.push(annotation);
            } else {
                aceAnnotations.push(annotation);
            }
        });

        // TODO!
        // //if the build is successful set cookie for buildCmd and execCmd
        // if(result.stats.error == 0)
        // {
        //     document.cookie = 'buildCmd=' + this.viewModel.buildCmd() + '; expires=Fri, 31 Dec 9999 23:59:59 GMT';
        //     document.cookie = 'execCmd=' + this.viewModel.execCmd() + '; expires=Fri, 31 Dec 9999 23:59:59 GMT';
        // }

        SysGlobalObservables.editorAnnotations(aceAnnotations);
        SysGlobalObservables.lastGccOutput(result.gccOutput);
        SysGlobalObservables.gccErrorCount(result.stats.error);
        SysGlobalObservables.gccWarningCount(result.stats.warning);
        SysGlobalObservables.gccOptsError(buildCmdErrors.map((error) => error.text).join('\n'));

        if (result.exitCode === 0) {
            SysGlobalObservables.compileStatus(result.stats.warning > 0 ? 'Warnings' : 'Success');
            this.runtime.sendExecCmd(SysGlobalObservables.execCmd());
        } else {
            SysGlobalObservables.compileStatus('Failed');
        }
    }

    runCode(buildCmd) {
        var callback = this.processGccCompletion.bind(this);
        SysGlobalObservables.compileStatus('Compiling');
        this.runtime.startBuild(buildCmd, callback);
    }
}

export default LiveEdit;
