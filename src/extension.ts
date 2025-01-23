import * as vscode from 'vscode';
// import { HelloWorldPanel } from './HelloWorldPanel';
import { SidebarProvider } from './SidebarProvider';

export function activate(context: vscode.ExtensionContext) {

	const sidebarProvider = new SidebarProvider(context.extensionUri);
	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider(
			"cph-leetcode-sidebar",
			sidebarProvider
		)
	);

	const getCurrentFileInfo=()=>{
        const editor=vscode.window.activeTextEditor;
        if(!editor){
            vscode.window.showErrorMessage('No File is Open...Please Open a File');
            return;
        }
        const document=editor.document;
        const fileName=document.fileName;
        const fileContent=document.getText();

        console.log(fileName);
        console.log(fileContent);
    };

	const view=vscode.window.createWebviewView(
		'cph-leetcode-sidebar',
		sidebarProvider
	);

	view.webview.onDidReceiveMessaage((message)=>{
		switch(message.command){
			case 'getCurrentFileInfo':
				getCurrentFileInfo();
				return;
		}
	},null,context.subscriptions);

	// context.subscriptions.push(vscode.commands.registerCommand('cph-leetcode.helloWorld', () => {
	// 	HelloWorldPanel.createOrShow(context.extensionUri);
	// }));

	// context.subscriptions.push(vscode.commands.registerCommand("cph-leetcode.askQuery", async () => {
	// 	const ans = await vscode.window.showInformationMessage("Apka kaisa din tha? ", "good", "bad");
	// 	if (ans === "good") {
	// 		vscode.window.showInformationMessage("Good Mittr");
	// 	}
	// 	else {
	// 		vscode.window.showInformationMessage("Stay Hard ");
	// 	}

	// }));
}
export function deactivate() { }
