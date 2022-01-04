import {
  Transaction,
  SystemProgram
} from '@solana/web3.js'

export const commitment = 'confirmed'

export async function sendTransaction (conn, wallet, { destination, lamports }) {
  console.log({ destination, lamports })
  const transaction = new Transaction()

  transaction.add(
    SystemProgram.transfer({
      fromPubkey: wallet.publicKey,
      toPubkey: destination,
      lamports
    })
  )

  transaction.feePayer = wallet.publicKey

  transaction.recentBlockhash = (await conn.getRecentBlockhash()).blockhash

  console.log(transaction)

  try {
    const signed = await wallet.signTransaction(transaction)
    console.log('Got signature, submitting transaction')
    const signature = await conn.sendRawTransaction(signed.serialize())
    console.log(
      'Submitted transaction ' + signature + ', awaiting confirmation'
    )
    const txid = await conn.confirmTransaction(signature)
    console.log('Transaction ' + signature + ' confirmed')

    return txid
  } catch (err) {
    console.warn(err)
    console.log('Error: ' + JSON.stringify(err))
  }
  return false
}
