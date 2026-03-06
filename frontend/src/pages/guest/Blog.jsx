import React, { useState } from 'react';
import { Button, Card, Badge } from '../../components/ui';
import { Header, Footer } from '../../components/common';

/* ─── Blog Data ─── */
const blogPosts = [
  {
    id: 1,
    category: 'Sức khỏe',
    title: '10 Lợi Ích Tuyệt Vời Khi Đạp Xe Mỗi Ngày',
    excerpt:
      'Đạp xe không chỉ là phương tiện di chuyển mà còn mang lại vô vàn lợi ích cho sức khỏe thể chất và tinh thần. Khám phá ngay 10 lý do bạn nên bắt đầu đạp xe từ hôm nay.',
    image: '/mountain_bike_hero_1768417732962.png',
    author: 'Bicycle Marketplace',
    date: '28 Tháng 2, 2026',
    readTime: '8 phút đọc',
    featured: true,
    content: [
      {
        heading: '1. Tăng cường sức khỏe tim mạch',
        text: 'Đạp xe là bài tập aerobic tuyệt vời giúp tim bơm máu hiệu quả hơn. Nghiên cứu từ Đại học Glasgow cho thấy những người đạp xe đi làm giảm 46% nguy cơ mắc bệnh tim mạch. Chỉ cần 30 phút đạp xe mỗi ngày, bạn đã cải thiện đáng kể hệ tuần hoàn của mình.',
      },
      {
        heading: '2. Giảm cân hiệu quả và bền vững',
        text: 'Đạp xe với tốc độ trung bình đốt khoảng 400-600 calo mỗi giờ, tùy thuộc vào cường độ và địa hình. Khác với chạy bộ, đạp xe ít gây chấn thương khớp gối, phù hợp với mọi lứa tuổi và cân nặng.',
      },
      {
        heading: '3. Cải thiện sức khỏe tinh thần',
        text: 'Khi đạp xe, cơ thể tiết ra endorphin — hormone tạo cảm giác hạnh phúc. Nghiên cứu từ tạp chí Lancet Psychiatry cho thấy đạp xe giảm 21,6% số ngày "sức khỏe tinh thần kém" so với người không tập thể dục.',
      },
      {
        heading: '4. Tăng cường hệ miễn dịch',
        text: 'Hoạt động thể chất vừa phải như đạp xe giúp tăng sản xuất tế bào miễn dịch. Một nghiên cứu trên tạp chí Aging Cell cho thấy những người đạp xe thường xuyên có hệ miễn dịch tương đương người trẻ tuổi.',
      },
      {
        heading: '5. Bảo vệ môi trường',
        text: 'Đạp xe không tạo ra khí thải CO₂. Theo European Cyclists Federation, nếu 10% dân số EU chuyển sang đạp xe, lượng khí thải sẽ giảm 7,3 triệu tấn mỗi năm. Mỗi km đạp xe thay vì lái xe giúp giảm 150g CO₂.',
      },
      {
        heading: '6. Tiết kiệm chi phí',
        text: 'Chi phí sở hữu xe đạp chỉ bằng 1/20 so với ô tô. Không cần xăng, bảo hiểm hay phí gửi xe đắt đỏ. Với xe đạp secondhand chất lượng từ Bicycle Marketplace, bạn còn tiết kiệm thêm 40-60% so với mua mới.',
      },
      {
        heading: '7. Cải thiện giấc ngủ',
        text: 'Đạp xe ngoài trời giúp cơ thể tiếp xúc ánh sáng tự nhiên, điều chỉnh nhịp sinh học. Nghiên cứu từ Stanford University cho thấy người tập thể dục vừa phải ngủ nhanh hơn 15 phút và ngủ sâu hơn 45 phút.',
      },
      {
        heading: '8. Tăng cường sức mạnh cơ bắp',
        text: 'Đạp xe tác động chủ yếu lên cơ đùi, bắp chân, mông và cơ core. Đạp xe leo đồi còn giúp xây dựng sức mạnh cơ bắp đáng kể mà không cần đến phòng gym.',
      },
      {
        heading: '9. Mở rộng mối quan hệ xã hội',
        text: 'Cộng đồng đạp xe tại Việt Nam đang phát triển mạnh mẽ. Tham gia các nhóm đạp xe, sự kiện và race giúp bạn kết nối với những người cùng sở thích, tạo dựng tình bạn lâu dài.',
      },
      {
        heading: '10. Khám phá thế giới xung quanh',
        text: 'Đạp xe cho phép bạn khám phá những con đường, góc phố mà ô tô không thể đến. Từ những cung đường ven biển Nha Trang đến đèo Hải Vân hùng vĩ, mỗi chuyến đi đều là một trải nghiệm đáng nhớ.',
      },
    ],
  },
  {
    id: 2,
    category: 'Nền tảng',
    title: 'Bicycle Marketplace — Nền Tảng Mua Bán Xe Đạp Uy Tín Số 1 Việt Nam',
    excerpt:
      'Tìm hiểu vì sao hàng nghìn người dùng tin tưởng Bicycle Marketplace cho mọi giao dịch xe đạp. Từ quy trình kiểm định chuyên sâu đến hệ thống ký quỹ an toàn.',
    image: '/road_bike_hero_1768417748558.png',
    author: 'Bicycle Marketplace',
    date: '25 Tháng 2, 2026',
    readTime: '10 phút đọc',
    featured: true,
    content: [
      {
        heading: 'Vì sao chọn Bicycle Marketplace?',
        text: 'Trong thị trường mua bán xe đạp secondhand đầy rủi ro, Bicycle Marketplace ra đời với sứ mệnh mang đến sự minh bạch, an toàn và tin cậy tuyệt đối cho mọi giao dịch. Chúng tôi không chỉ là nơi đăng tin — chúng tôi là đối tác đồng hành của bạn.',
      },
      {
        heading: '🔍 Quy trình kiểm định 18 hạng mục',
        text: 'Mỗi chiếc xe trên nền tảng đều trải qua kiểm định chuyên sâu bởi đội ngũ chuyên gia với hơn 10 năm kinh nghiệm. 18 hạng mục bao gồm: khung sườn, phuộc, hệ thống phanh, bộ truyền động, bánh xe, vành, líp, xích, pedal, yên, ghi-đông, cốt yên, stem, headset, bottom bracket, lốp, ruột và phụ kiện đi kèm.',
      },
      {
        heading: '🛡️ Hệ thống ký quỹ (Escrow) an toàn',
        text: 'Tiền của người mua được giữ an toàn trong tài khoản ký quỹ cho đến khi xác nhận xe đúng mô tả. Nếu xe không đúng báo cáo kiểm định, bạn được hoàn tiền 100%. Quy trình hoàn toàn tự động, minh bạch và không thiên vị.',
      },
      {
        heading: '📦 Vận chuyển có bảo hiểm',
        text: 'Mỗi đơn hàng đều được đóng gói chuyên dụng cho xe đạp, vận chuyển có bảo hiểm toàn phần. Theo dõi trạng thái đơn hàng theo thời gian thực từ khi đóng gói đến khi giao tận tay. Nếu xe bị hư hỏng trong quá trình vận chuyển, bạn được bồi thường đầy đủ.',
      },
      {
        heading: '⭐ Hệ thống đánh giá uy tín',
        text: 'Mỗi giao dịch hoàn tất, cả người mua và người bán đều đánh giá lẫn nhau. Hệ thống rating minh bạch giúp bạn dễ dàng nhận biết người bán/mua đáng tin cậy. Người bán có rating cao được gắn huy hiệu "Verified Seller" và ưu tiên hiển thị.',
      },
      {
        heading: '💬 Chat tích hợp & Hỗ trợ 24/7',
        text: 'Nhắn tin trực tiếp với người bán/mua ngay trên nền tảng mà không cần chia sẻ số điện thoại cá nhân. Đội ngũ hỗ trợ khách hàng sẵn sàng 24/7 để giải đáp mọi thắc mắc và xử lý tranh chấp nhanh chóng.',
      },
      {
        heading: '📊 Công cụ định giá thông minh',
        text: 'Hệ thống AI phân tích dữ liệu thị trường để đề xuất giá hợp lý cho người bán và cảnh báo người mua khi giá cao hơn thị trường. Không bao giờ bị "hớ giá" khi giao dịch trên Bicycle Marketplace.',
      },
      {
        heading: '🌱 Cam kết bền vững',
        text: 'Mỗi chiếc xe đạp secondhand được tái sử dụng giúp giảm 240kg CO₂ so với sản xuất mới. Bicycle Marketplace tự hào đã góp phần giảm hơn 500 tấn CO₂ thông qua hàng nghìn giao dịch thành công.',
      },
      {
        heading: 'Con số ấn tượng',
        text: '• 10,000+ người dùng đã đăng ký\n• 2,500+ xe đang rao bán\n• 8,000+ giao dịch thành công\n• 95% đánh giá 5 sao\n• 99.2% tỷ lệ an toàn giao dịch\n• Hoạt động tại 30+ tỉnh thành',
      },
    ],
  },
  {
    id: 3,
    category: 'Hướng dẫn',
    title: 'Hướng Dẫn Chọn Xe Đạp Phù Hợp Cho Người Mới',
    excerpt:
      'Mountain bike, road bike hay hybrid? Bài viết này giúp bạn hiểu rõ từng loại xe và chọn chiếc phù hợp nhất với nhu cầu, ngân sách và phong cách đạp.',
    image: '/marketplace_hero_banner_1768417779045.png',
    author: 'Bicycle Marketplace',
    date: '20 Tháng 2, 2026',
    readTime: '7 phút đọc',
    featured: false,
    content: [
      {
        heading: 'Xe đạp địa hình (Mountain Bike)',
        text: 'Thiết kế cho đường off-road, khung chắc chắn, lốp bản rộng có gai bám tốt, hệ thống giảm xóc trước (hardtail) hoặc cả trước sau (full-suspension). Phù hợp nếu bạn thích phiêu lưu, đạp xe trong rừng, leo đồi hoặc đường gồ ghề. Giá tham khảo: 5-50 triệu VNĐ.',
      },
      {
        heading: 'Xe đạp đường trường (Road Bike)',
        text: 'Khung nhẹ (thường bằng carbon hoặc nhôm), lốp mỏng áp suất cao, tay lái cong (drop bar) giúp khí động học tốt. Lý tưởng cho đạp xe tốc độ trên đường nhựa, đi tour đường dài hoặc tập luyện. Giá tham khảo: 8-80 triệu VNĐ.',
      },
      {
        heading: 'Xe đạp hybrid',
        text: 'Kết hợp ưu điểm của mountain bike và road bike. Khung nhẹ trung bình, lốp vừa phải, tay lái thẳng thoải mái. Hoàn hảo cho đi làm hàng ngày, đạp dạo phố, và đường nhựa có chút gồ ghề. Giá tham khảo: 4-25 triệu VNĐ.',
      },
      {
        heading: 'Xe đạp điện (E-Bike)',
        text: 'Có motor hỗ trợ điện, pin lithium, giúp đạp nhẹ nhàng hơn đặc biệt khi leo dốc. Phù hợp cho người lớn tuổi, đi làm đường xa, hoặc muốn đạp xe mà không quá mệt. Giá tham khảo: 10-60 triệu VNĐ.',
      },
      {
        heading: 'Cách chọn size khung phù hợp',
        text: 'Chiều cao 155-165cm: size S (15-16"). 165-175cm: size M (17-18"). 175-185cm: size L (19-20"). 185cm+: size XL (21-22"). Khi ngồi lên xe, bạn nên chạm được đầu ngón chân xuống đất và đầu gối hơi cong khi pedal ở vị trí thấp nhất.',
      },
      {
        heading: 'Mua xe mới hay secondhand?',
        text: 'Xe secondhand chất lượng từ Bicycle Marketplace tiết kiệm 40-60% so với mua mới. Mọi xe đều qua kiểm định 18 hạng mục, có bảo hành và hỗ trợ hoàn tiền nếu không đúng mô tả. Đây là lựa chọn thông minh cho cả người mới và dân chơi xe.',
      },
    ],
  },
  {
    id: 4,
    category: 'Cộng đồng',
    title: 'Top 5 Cung Đường Đạp Xe Đẹp Nhất Việt Nam',
    excerpt:
      'Từ đèo Hải Vân hùng vĩ đến con đường ven biển Nha Trang thơ mộng. Khám phá những cung đường đạp xe khiến bạn mê mẩn.',
    image: '/mountain_bike_hero_1768417732962.png',
    author: 'Bicycle Marketplace',
    date: '15 Tháng 2, 2026',
    readTime: '6 phút đọc',
    featured: false,
    content: [
      {
        heading: '1. Đèo Hải Vân (Đà Nẵng - Huế)',
        text: 'Cung đường huyền thoại dài 21km với độ cao 500m so với mực nước biển. Từ đỉnh đèo, bạn được chiêm ngưỡng toàn cảnh biển Đông và bán đảo Sơn Trà. Thời điểm đẹp nhất: tháng 3-8. Độ khó: 4/5.',
      },
      {
        heading: '2. Ven biển Nha Trang - Cam Ranh',
        text: 'Tuyến đường ven biển dài 30km với cát trắng và nước biển trong xanh hai bên. Địa hình bằng phẳng, phù hợp mọi trình độ. Dừng chân tại Bãi Dài để nghỉ ngơi và tắm biển.',
      },
      {
        heading: '3. Hồ Tây - Hà Nội',
        text: 'Vòng quanh Hồ Tây dài 17km là cung đường đạp xe thư giãn giữa lòng thủ đô. Đạp xe sáng sớm hoặc chiều tà khi hoàng hôn phản chiếu trên mặt hồ là trải nghiệm tuyệt vời.',
      },
      {
        heading: '4. Đà Lạt - Langbiang',
        text: 'Cung đường từ trung tâm Đà Lạt lên núi Langbiang dài 12km với cảnh rừng thông và đồi chè xanh mướt. Không khí mát mẻ quanh năm 18-25°C, lý tưởng cho đạp xe mùa hè.',
      },
      {
        heading: '5. Cần Giờ (TP. Hồ Chí Minh)',
        text: 'Khu dự trữ sinh quyển Cần Giờ cách trung tâm TP.HCM 50km, với đường xuyên rừng ngập mặn. Đạp xe qua cầu khỉ, qua đầm tôm, ngắm khỉ hoang dã — thiên nhiên ngay giữa đô thị.',
      },
    ],
  },
];

const categoryColors = {
  'Sức khỏe': { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  'Nền tảng': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  'Hướng dẫn': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  'Cộng đồng': { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
};

/* ─── Blog Page Component ─── */
const Blog = ({ onNavigate, isAuthenticated = false, role = null, user = null, onLogout }) => {
  const [selectedPost, setSelectedPost] = useState(null);
  const [activeCategory, setActiveCategory] = useState('Tất cả');

  const categories = ['Tất cả', ...new Set(blogPosts.map((p) => p.category))];

  const filteredPosts =
    activeCategory === 'Tất cả'
      ? blogPosts
      : blogPosts.filter((p) => p.category === activeCategory);

  const featuredPosts = blogPosts.filter((p) => p.featured);

  /* ─── Article Detail View ─── */
  if (selectedPost) {
    const post = blogPosts.find((p) => p.id === selectedPost);
    if (!post) return null;
    const catColor = categoryColors[post.category] || categoryColors['Sức khỏe'];

    return (
      <div className="min-h-screen bg-white">
        <Header
          isAuthenticated={isAuthenticated}
          role={role}
          currentPage="blog"
          onNavigate={onNavigate}
          userName={user?.fullName}
          userEmail={user?.email}
          onLogout={onLogout}
        />

        {/* Hero banner */}
        <div className="relative h-[400px] md:h-[480px]">
          <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
            <div className="max-w-4xl mx-auto">
              <span
                className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${catColor.bg} ${catColor.text} mb-4`}
              >
                {post.category}
              </span>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
                {post.title}
              </h1>
              <div className="flex items-center gap-4 text-white/80 text-sm">
                <span>{post.author}</span>
                <span>•</span>
                <span>{post.date}</span>
                <span>•</span>
                <span>{post.readTime}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Article content */}
        <article className="max-w-4xl mx-auto px-6 py-12">
          <p className="text-lg text-warmgray-600 leading-relaxed mb-10 border-l-4 border-gold pl-6 italic">
            {post.excerpt}
          </p>

          <div className="space-y-8">
            {post.content.map((section, idx) => (
              <div key={idx}>
                <h2 className="text-xl md:text-2xl font-bold text-warmgray-900 mb-3">
                  {section.heading}
                </h2>
                <p className="text-warmgray-600 leading-relaxed whitespace-pre-line">
                  {section.text}
                </p>
              </div>
            ))}
          </div>

          {/* Share & back */}
          <div className="mt-16 pt-8 border-t border-warmgray-200 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setSelectedPost(null)}
              className="inline-flex items-center gap-2 text-sm font-semibold text-primary-800 hover:text-primary-900 transition-colors"
            >
              ← Quay lại danh sách bài viết
            </button>
            <div className="flex items-center gap-3 text-sm text-warmgray-500">
              <span>Chia sẻ:</span>
              <button type="button" className="hover:text-blue-600 transition-colors font-semibold">
                Facebook
              </button>
              <button type="button" className="hover:text-sky-500 transition-colors font-semibold">
                Twitter
              </button>
            </div>
          </div>

          {/* Related CTA */}
          <div className="mt-12 p-8 rounded-2xl bg-gradient-to-r from-primary-800 to-emerald-700 text-white text-center">
            <h3 className="text-2xl font-bold mb-3">Sẵn sàng trải nghiệm?</h3>
            <p className="text-white/80 mb-6 max-w-lg mx-auto">
              Khám phá hàng nghìn chiếc xe đạp chất lượng đã qua kiểm định trên Bicycle Marketplace.
            </p>
            <Button
              variant="primary"
              className="bg-white text-primary-800 hover:bg-white/90"
              onClick={() => onNavigate && onNavigate('marketplace')}
            >
              Khám phá Marketplace →
            </Button>
          </div>
        </article>

        <Footer />
      </div>
    );
  }

  /* ─── Blog Listing View ─── */
  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-offwhite to-white">
      <Header
        isAuthenticated={isAuthenticated}
        role={role}
        currentPage="blog"
        onNavigate={onNavigate}
        userName={user?.fullName}
        userEmail={user?.email}
        onLogout={onLogout}
      />

      {/* Hero */}
      <section
        className="relative py-20 md:py-28 overflow-hidden"
        style={{ backgroundColor: 'var(--lux-primary-900)' }}
      >
        <div className="absolute inset-0 opacity-20">
          <div
            className="w-full h-full"
            style={{
              backgroundImage:
                'radial-gradient(circle at 20% 50%, var(--lux-primary-500) 0%, transparent 50%), radial-gradient(circle at 80% 50%, var(--lux-gold) 0%, transparent 50%)',
            }}
          />
        </div>
        <div className="container-custom relative text-center">
          <p
            className="text-sm font-semibold uppercase tracking-widest mb-4"
            style={{ color: 'var(--lux-gold)' }}
          >
            Blog & Kiến thức
          </p>
          <h1
            className="text-4xl md:text-5xl lg:text-6xl font-bold font-display mb-6"
            style={{ color: 'white' }}
          >
            Bicycle Journal
          </h1>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--lux-gold-light)' }}>
            Chia sẻ kiến thức về xe đạp, lợi ích sức khỏe, hướng dẫn chọn xe và tin tức từ cộng đồng
            Bicycle Marketplace.
          </p>
        </div>
      </section>

      {/* Featured posts */}
      <section className="py-16">
        <div className="container-custom">
          <div className="grid md:grid-cols-2 gap-8">
            {featuredPosts.map((post) => {
              const catColor = categoryColors[post.category] || categoryColors['Sức khỏe'];
              return (
                <button
                  key={post.id}
                  type="button"
                  onClick={() => setSelectedPost(post.id)}
                  className="group relative overflow-hidden rounded-2xl text-left h-[380px]"
                >
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${catColor.bg} ${catColor.text} mb-3`}
                    >
                      {post.category}
                    </span>
                    <h2 className="text-xl md:text-2xl font-bold text-white mb-2 line-clamp-2 group-hover:text-gold transition-colors">
                      {post.title}
                    </h2>
                    <p className="text-white/70 text-sm line-clamp-2">{post.excerpt}</p>
                    <div className="flex items-center gap-3 mt-3 text-white/60 text-xs">
                      <span>{post.date}</span>
                      <span>•</span>
                      <span>{post.readTime}</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Category filter + All posts */}
      <section className="pb-20">
        <div className="container-custom">
          {/* Category pills */}
          <div className="flex flex-wrap gap-3 mb-10 justify-center">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className="px-5 py-2 rounded-full text-sm font-semibold transition-all"
                style={
                  activeCategory === cat
                    ? {
                        backgroundColor: 'var(--lux-primary-800)',
                        color: 'white',
                        boxShadow: 'var(--lux-shadow-elevated)',
                      }
                    : {
                        backgroundColor: 'var(--lux-gray-100)',
                        color: 'var(--lux-gray-600)',
                      }
                }
                onMouseEnter={(e) => {
                  if (activeCategory !== cat) {
                    e.currentTarget.style.backgroundColor = 'var(--lux-gray-200)';
                    e.currentTarget.style.color = 'var(--lux-primary-800)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeCategory !== cat) {
                    e.currentTarget.style.backgroundColor = 'var(--lux-gray-100)';
                    e.currentTarget.style.color = 'var(--lux-gray-600)';
                  }
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Posts grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPosts.map((post) => {
              const catColor = categoryColors[post.category] || categoryColors['Sức khỏe'];
              return (
                <Card
                  key={post.id}
                  className="overflow-hidden cursor-pointer hover-lift card-surface group"
                  onClick={() => setSelectedPost(post.id)}
                >
                  <div className="relative aspect-[16/10] bg-warmgray-100 overflow-hidden">
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <span
                      className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold ${catColor.bg} ${catColor.text}`}
                    >
                      {post.category}
                    </span>
                  </div>
                  <div className="p-5">
                    <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-primary-800 transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-warmgray-500 text-sm line-clamp-3 mb-4">{post.excerpt}</p>
                    <div className="flex items-center justify-between text-xs text-warmgray-400">
                      <span>{post.date}</span>
                      <span>{post.readTime}</span>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-warmgray-50">
        <div className="container-custom text-center">
          <p className="text-sm font-semibold text-gold uppercase tracking-widest mb-3">
            Bắt đầu hành trình
          </p>
          <h3 className="text-2xl md:text-3xl font-bold font-display mb-4">
            Tìm chiếc xe đạp hoàn hảo cho bạn
          </h3>
          <p className="text-warmgray-500 max-w-xl mx-auto mb-8">
            Hàng nghìn xe đạp đã qua kiểm định, giao dịch an toàn qua ký quỹ, vận chuyển có bảo
            hiểm.
          </p>
          <Button variant="primary" onClick={() => onNavigate && onNavigate('marketplace')}>
            Khám phá Marketplace →
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Blog;
