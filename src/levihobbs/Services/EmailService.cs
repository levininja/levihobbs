using System.Net;
using System.Net.Mail;
using Microsoft.Extensions.Options;
using Microsoft.Extensions.Logging;
using levihobbs.Models;

namespace levihobbs.Services;

public class EmailService : IEmailService
{
    private readonly EmailSettings _settings;
    private readonly ILogger<EmailService> _logger;

    public EmailService(IOptions<EmailSettings> settings, ILogger<EmailService> logger)
    {
        _settings = settings.Value;
        _logger = logger;
    }

    public async Task<bool> SendEmailAsync(string toEmail, string subject, string body, string? fromEmail = null)
    {
        try
        {
            using (SmtpClient client = new SmtpClient(_settings.SmtpServer, _settings.SmtpPort))
            {
                client.EnableSsl = _settings.EnableSsl;
                client.Credentials = new NetworkCredential(_settings.SmtpUsername, _settings.SmtpPassword);

                using (MailMessage message = new MailMessage())
                {
                    message.From = new MailAddress(fromEmail ?? _settings.FromEmail);
                    message.To.Add(new MailAddress(toEmail));
                    message.Subject = subject;
                    message.Body = body;
                    message.IsBodyHtml = true;

                    await client.SendMailAsync(message);
                    _logger.LogInformation("Email sent successfully to {ToEmail} with subject {Subject}", toEmail, subject);
                    return true;
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send email to {ToEmail} with subject {Subject}", toEmail, subject);
            return false;
        }
    }
}
