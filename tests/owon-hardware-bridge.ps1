# Test-only serial bridge. All commands come from the application adapter test.
$meterPort = [System.IO.Ports.SerialPort]::new('COM3',115200,[System.IO.Ports.Parity]::None,8,[System.IO.Ports.StopBits]::One)
$meterPort.ReadTimeout=3000
$meterPort.WriteTimeout=3000
$meterPort.NewLine="`n"
$meterPort.Encoding=[System.Text.Encoding]::GetEncoding(1252)
try {
  $meterPort.Open()
  while ($null -ne ($command = [Console]::ReadLine())) {
    $meterPort.DiscardInBuffer()
    $meterPort.WriteLine($command)
    if ($command.Contains('?')) {
      try {
        $responseBytes = $meterPort.Encoding.GetBytes($meterPort.ReadLine().Trim() + "`n")
        $outputStream = [Console]::OpenStandardOutput()
        $outputStream.Write($responseBytes, 0, $responseBytes.Length)
        $outputStream.Flush()
      } catch { [Console]::Error.WriteLine($_.Exception.Message) }
    } else { Start-Sleep -Milliseconds 100 }
  }
} finally { $meterPort.Dispose() }
