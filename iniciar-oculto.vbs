' ============================================================
'  BJ Sender - iniciar SEM a janela preta do terminal.
'  De dois cliques neste arquivo para usar no dia a dia.
'  (Para parar o programa depois, use o PARAR.bat)
' ============================================================
Option Explicit

Dim shell, fso, pasta, aspas
Set shell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")
aspas = Chr(34)

' Roda sempre a partir da pasta onde este arquivo esta
pasta = fso.GetParentFolderName(WScript.ScriptFullName)
shell.CurrentDirectory = pasta

' Aviso rapido, fecha sozinho em 4 segundos (64 = icone de informacao)
shell.Popup "Iniciando o BJ Sender..." & vbCrLf & vbCrLf & _
    "O navegador vai abrir sozinho em instantes." & vbCrLf & _
    "Na primeira vez pode demorar alguns minutos.", 4, "BJ Sender", 64

' Roda o INICIAR.bat OCULTO (0 = janela escondida). O parametro "oculto"
' faz o .bat nao ficar esperando o usuario apertar uma tecla.
shell.Run aspas & pasta & "\INICIAR.bat" & aspas & " oculto", 0, False
