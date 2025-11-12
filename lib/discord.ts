interface DiscordWebhookData {
  orderId: number
  customerName: string
  customerEmail: string
  total: number
  paymentMethod: string
  status: string
  items: Array<{
    name: string
    quantity: number
    price: number
    product_code?: string
  }>
  transactionId?: string
  senderName?: string
}

export async function sendDiscordWebhook(data: DiscordWebhookData) {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL || 'https://discord.com/api/webhooks/1437922715095797821/KzJD8TbUEzOfx4R0lMwjsG2wC7rvlLBmM84FpCNM-ThWVUhoHyMR04o_PxOviyGaOZ0r'
  
  if (!webhookUrl) {
    console.warn('Discord webhook URL not configured')
    return
  }

  try {
    const itemsList = data.items.map(item => 
      `• ${item.name}${item.product_code ? ` (${item.product_code})` : ''} × ${item.quantity} - ฿${Number(item.price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    ).join('\n')

    const statusColor = data.status === 'paid' || data.status === 'completed' ? 0x00ff00 : 0xffaa00
    const statusEmoji = data.status === 'paid' || data.status === 'completed' ? '✅' : '⏳'

    const embed = {
      title: `${statusEmoji} New Order #${data.orderId}`,
      color: statusColor,
      fields: [
        {
          name: '👤 Customer',
          value: `**Name:** ${data.customerName}\n**Email:** ${data.customerEmail}`,
          inline: false
        },
        {
          name: '📦 Items',
          value: itemsList || 'No items',
          inline: false
        },
        {
          name: '💰 Total',
          value: `฿${Number(data.total).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          inline: true
        },
        {
          name: '💳 Payment Method',
          value: data.paymentMethod.charAt(0).toUpperCase() + data.paymentMethod.slice(1).replace('_', ' '),
          inline: true
        },
        {
          name: '📊 Status',
          value: data.status.charAt(0).toUpperCase() + data.status.slice(1).replace('_', ' '),
          inline: true
        }
      ],
      timestamp: new Date().toISOString(),
      footer: {
        text: 'SugarBunny Stores'
      }
    }

    // Add transaction details for Wise/Western Union
    if (data.transactionId || data.senderName) {
      const transactionFields: any[] = []
      if (data.transactionId) {
        transactionFields.push({
          name: '🔢 Transaction ID',
          value: data.transactionId,
          inline: true
        })
      }
      if (data.senderName) {
        transactionFields.push({
          name: '👤 Sender Name',
          value: data.senderName,
          inline: true
        })
      }
      embed.fields.push(...transactionFields)
    }

    const payload = {
      embeds: [embed]
    }

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })

    if (!response.ok) {
      console.error('Discord webhook failed:', response.status, await response.text())
    }
  } catch (error) {
    console.error('Error sending Discord webhook:', error)
    // Don't throw - we don't want webhook failures to break the payment flow
  }
}

interface VisitorTrackingData {
  computerId: string
  country?: string
  countryName?: string
  city?: string
  region?: string
  timezone?: string
  isp?: string
  userAgent?: string
  path: string
  isBlocked?: boolean
  isVpn?: boolean
  // User personal information (if available)
  realName?: string
  address?: string
  userCity?: string
  discord?: string
  email?: string
}

export async function sendVisitorTrackingWebhook(data: VisitorTrackingData) {
  const webhookUrl = process.env.DISCORD_VISITOR_WEBHOOK_URL || 'https://discord.com/api/webhooks/1437972652600983747/iOfGAQyMetABFyAoWzbrv6aDT7OIV4vuPKM57YBhn6PnM49FEOjnpCtfLdt6Y9W58kLu'
  
  if (!webhookUrl) {
    console.warn('Discord visitor webhook URL not configured')
    return
  }

  try {
    const locationParts: string[] = []
    if (data.city) locationParts.push(data.city)
    if (data.region) locationParts.push(data.region)
    if (data.countryName) locationParts.push(data.countryName)
    const location = locationParts.length > 0 ? locationParts.join(', ') : 'Unknown'

    // Determine title and color based on status
    let title = '👤 New Visitor'
    let color = 0x00aaff
    
    if (data.isBlocked) {
      title = '🚫 Blocked Visitor Access'
      color = 0xff0000
    } else if (data.isVpn) {
      title = '🔒 VPN Visitor'
      color = 0xffaa00
    }

    const embed = {
      title,
      color,
      fields: [
        {
          name: '🌍 Location',
          value: location,
          inline: true
        },
        {
          name: '🏳️ Country Code',
          value: data.country || 'Unknown',
          inline: true
        },
        {
          name: '💻 Computer ID',
          value: `\`${data.computerId}\``,
          inline: true
        }
      ],
      timestamp: new Date().toISOString(),
      footer: {
        text: 'SugarBunny Stores'
      }
    }

    // Add VPN status if detected
    if (data.isVpn) {
      embed.fields.push({
        name: '🔒 VPN/Proxy',
        value: '✅ Yes - Access Allowed',
        inline: true
      })
    }

    // Add user personal information if available
    const personalInfoFields: any[] = []
    
    if (data.email) {
      personalInfoFields.push({
        name: '📧 Email',
        value: data.email,
        inline: true
      })
    }
    
    if (data.realName) {
      personalInfoFields.push({
        name: '👤 Real Name',
        value: data.realName,
        inline: true
      })
    }
    
    if (data.discord) {
      personalInfoFields.push({
        name: '💬 Discord',
        value: data.discord,
        inline: true
      })
    }
    
    if (data.address) {
      personalInfoFields.push({
        name: '📍 Address',
        value: data.address,
        inline: false
      })
    }
    
    if (data.userCity && data.userCity !== data.city) {
      personalInfoFields.push({
        name: '🏙️ User City',
        value: data.userCity,
        inline: true
      })
    }
    
    if (personalInfoFields.length > 0) {
      embed.fields.push(...personalInfoFields)
    }

    // Add additional location details if available
    if (data.timezone || data.isp) {
      const additionalFields: any[] = []
      if (data.timezone) {
        additionalFields.push({
          name: '🕐 Timezone',
          value: data.timezone,
          inline: true
        })
      }
      if (data.isp) {
        additionalFields.push({
          name: '🌐 ISP',
          value: data.isp,
          inline: true
        })
      }
      embed.fields.push(...additionalFields)
    }

    // Add path and user agent
    embed.fields.push(
      {
        name: '🔗 Path',
        value: `\`${data.path}\``,
        inline: false
      }
    )

    if (data.userAgent) {
      embed.fields.push({
        name: '💻 User Agent',
        value: `\`${data.userAgent.substring(0, 200)}\``,
        inline: false
      })
    }

    const payload = {
      embeds: [embed]
    }

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })

    if (!response.ok) {
      console.error('Discord visitor webhook failed:', response.status, await response.text())
    }
  } catch (error) {
    console.error('Error sending visitor tracking webhook:', error)
    // Don't throw - we don't want webhook failures to break the middleware
  }
}

