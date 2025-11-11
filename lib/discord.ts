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

