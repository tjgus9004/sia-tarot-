$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add('http://localhost:3333/')
$listener.Start()
Write-Host "Server running at http://localhost:3333/"
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
while ($listener.IsListening) {
    $ctx = $listener.GetContext()
    $req = $ctx.Request
    $res = $ctx.Response
    $path = $req.Url.LocalPath
    if ($path -eq '/' -or $path -eq '') { $path = '/index.html' }
    $file = Join-Path $root $path.TrimStart('/')
    if (Test-Path $file -PathType Leaf) {
        $ext = [System.IO.Path]::GetExtension($file)
        $mime = if ($ext -eq '.html') {'text/html; charset=utf-8'} elseif ($ext -eq '.js') {'application/javascript'} elseif ($ext -eq '.css') {'text/css'} else {'application/octet-stream'}
        $bytes = [System.IO.File]::ReadAllBytes($file)
        $res.ContentType = $mime
        $res.ContentLength64 = $bytes.Length
        $res.OutputStream.Write($bytes, 0, $bytes.Length)
    } else {
        $res.StatusCode = 404
    }
    $res.Close()
}
